param(
  [int]$IntervalSeconds = 30,
  [string]$QueuePath = "",
  [switch]$Once,
  [switch]$ProcessExisting
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
if (-not $QueuePath) {
  $QueuePath = Join-Path $RepoRoot "app\desktop_observer\outlook_desktop_queue.json"
}
$StatePath = Join-Path $ScriptDir "outlook_desktop_state.json"

function Get-NowIso {
  return (Get-Date).ToUniversalTime().ToString("o")
}

function Read-JsonFile {
  param([string]$Path, [object]$Fallback)
  if (-not (Test-Path -LiteralPath $Path)) {
    return $Fallback
  }
  try {
    return Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json
  } catch {
    return $Fallback
  }
}

function Write-JsonFile {
  param([string]$Path, [object]$Value)
  $dir = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
  }
  $json = $Value | ConvertTo-Json -Depth 12
  Set-Content -LiteralPath $Path -Value $json -Encoding UTF8
}

function Get-OutlookApplication {
  try {
    return [Runtime.InteropServices.Marshal]::GetActiveObject("Outlook.Application")
  } catch {
    throw "Outlook Desktop no esta abierto. Abrir Outlook y volver a iniciar el observer."
  }
}

function Get-SmtpAddress {
  param($Mail)
  try {
    if ($Mail.SenderEmailType -eq "EX") {
      $exchangeUser = $Mail.Sender.GetExchangeUser()
      if ($exchangeUser -and $exchangeUser.PrimarySmtpAddress) {
        return $exchangeUser.PrimarySmtpAddress
      }
    }
  } catch {}
  try {
    return [string]$Mail.SenderEmailAddress
  } catch {
    return ""
  }
}

function Get-BodyPreview {
  param($Mail)
  try {
    $body = [string]$Mail.Body
    $clean = ($body -replace "\r", " " -replace "\n", " ") -replace "\s+", " "
    if ($clean.Length -gt 700) {
      return $clean.Substring(0, 700)
    }
    return $clean
  } catch {
    return ""
  }
}

function Get-Priority {
  param([string]$Text, [int]$Importance)
  $value = ($Text + "").ToLowerInvariant()
  $highSignals = @("master florestal", "ponsse", "gb", "quantum", "oregon", "log max", "ecolog", "cliente", "proveedor", "precio", "margen", "contrato", "decision", "decisión", "urgente")
  $mediumSignals = @("seguimiento", "propuesta", "reunion", "reunión", "oportunidad", "consulta", "pendiente")

  if ($Importance -eq 2) { return "HIGH" }
  foreach ($signal in $highSignals) {
    if ($value.Contains($signal)) { return "HIGH" }
  }
  foreach ($signal in $mediumSignals) {
    if ($value.Contains($signal)) { return "MEDIUM" }
  }
  return "LOW"
}

function Get-Project {
  param([string]$Text)
  $value = ($Text + "").ToLowerInvariant()
  $rules = @(
    @{ project = "Mercado Forestal"; terms = @("brasil", "master", "florestal", "mercado forestal", "ponsse") },
    @{ project = "GB Sudamerica"; terms = @("gb", "gb sudamerica") },
    @{ project = "Outdoor Import"; terms = @("outdoor") },
    @{ project = "URUFOREST"; terms = @("uruforest") },
    @{ project = "Mantenimiento Mental"; terms = @("mantenimiento mental") },
    @{ project = "Guia Express"; terms = @("guia express", "guía express") },
    @{ project = "Caseritas"; terms = @("caseritas") },
    @{ project = "Quantum"; terms = @("quantum") }
  )

  foreach ($rule in $rules) {
    foreach ($term in $rule.terms) {
      if ($value.Contains($term)) {
        return $rule.project
      }
    }
  }
  return "General"
}

function Convert-MailToObservation {
  param($Mail, [string]$FolderPath)
  $senderName = ""
  try { $senderName = [string]$Mail.SenderName } catch {}
  $senderEmail = Get-SmtpAddress -Mail $Mail
  $subject = ""
  try { $subject = [string]$Mail.Subject } catch {}
  $bodyPreview = Get-BodyPreview -Mail $Mail
  $received = Get-NowIso
  try { $received = ([datetime]$Mail.ReceivedTime).ToUniversalTime().ToString("o") } catch {}
  $entryId = [string]$Mail.EntryID
  $text = "$senderName $senderEmail $subject $bodyPreview"
  $project = Get-Project -Text $text
  $priority = Get-Priority -Text $text -Importance ([int]$Mail.Importance)

  return [ordered]@{
    id = "outlook-desktop-$entryId"
    source = "outlook_desktop"
    type = "email"
    entity = $project
    title = $(if ($subject) { $subject } else { "(sin asunto)" })
    description = $bodyPreview
    priority = $priority
    timestamp = $received
    metadata = [ordered]@{
      senderName = $senderName
      senderEmail = $senderEmail
      folder = $FolderPath
      entryId = $entryId
      readOnly = $true
      shouldAppearInBriefing = ($priority -eq "HIGH" -or $priority -eq "MEDIUM")
    }
  }
}

function Get-RecentInboxMail {
  $outlook = Get-OutlookApplication
  $namespace = $outlook.GetNamespace("MAPI")
  $inbox = $namespace.GetDefaultFolder(6)
  $items = $inbox.Items
  $items.Sort("[ReceivedTime]", $true)
  $folderPath = [string]$inbox.FolderPath
  $messages = @()

  $max = [Math]::Min($items.Count, 50)
  for ($i = 1; $i -le $max; $i++) {
    $item = $items.Item($i)
    if ($item -and $item.MessageClass -like "IPM.Note*") {
      $messages += [pscustomobject]@{
        Mail = $item
        FolderPath = $folderPath
      }
    }
  }
  return $messages
}

function Invoke-OutlookDesktopCycle {
  $state = Read-JsonFile -Path $StatePath -Fallback ([pscustomobject]@{
    initialized = $false
    processedEntryIds = @()
    totalProcessed = 0
  })
  $queue = Read-JsonFile -Path $QueuePath -Fallback ([pscustomobject]@{
    status = "Esperando"
    lastReview = $null
    lastEmail = $null
    processedCount = 0
    intervalSeconds = $IntervalSeconds
    observations = @()
  })
  $stateInitialized = [bool]$state.initialized
  $stateTotalProcessed = if ($state.totalProcessed -ne $null) { [int]$state.totalProcessed } else { 0 }
  $queueObservations = @($queue.observations)
  $queueLastEmail = $queue.lastEmail

  try {
    $messages = Get-RecentInboxMail
    $known = @{}
    foreach ($id in @($state.processedEntryIds)) {
      if ($id) { $known[[string]$id] = $true }
    }

    if (-not $stateInitialized -and -not $ProcessExisting) {
      foreach ($message in $messages) {
        try {
          $entryId = [string]$message.Mail.EntryID
          if ($entryId) { $known[$entryId] = $true }
        } catch {}
      }
      Write-JsonFile -Path $StatePath -Value ([ordered]@{
        initialized = $true
        processedEntryIds = @($known.Keys)
        totalProcessed = $stateTotalProcessed
      })
      Write-JsonFile -Path $QueuePath -Value ([ordered]@{
        status = "Esperando"
        lastReview = Get-NowIso
        lastEmail = $queueLastEmail
        processedCount = $stateTotalProcessed
        intervalSeconds = $IntervalSeconds
        observations = $queueObservations
        error = $null
      })
      return
    }

    $newObservations = @()
    for ($index = $messages.Count - 1; $index -ge 0; $index--) {
      $message = $messages[$index]
      $mail = $message.Mail
      $entryId = [string]$mail.EntryID
      if (-not $entryId -or $known.ContainsKey($entryId)) { continue }
      $observation = Convert-MailToObservation -Mail $mail -FolderPath $message.FolderPath
      $newObservations += $observation
      $known[$entryId] = $true
    }

    $allObservations = @($queue.observations) + $newObservations
    if ($allObservations.Count -gt 100) {
      $allObservations = $allObservations | Select-Object -Last 100
    }

    $lastObservation = if ($newObservations.Count) { $newObservations[-1] } else { $queueLastEmail }
    $nextTotal = $stateTotalProcessed + $newObservations.Count

    Write-JsonFile -Path $StatePath -Value ([ordered]@{
      initialized = $true
      processedEntryIds = @($known.Keys | Select-Object -Last 500)
      totalProcessed = $nextTotal
    })
    Write-JsonFile -Path $QueuePath -Value ([ordered]@{
      status = "Activo"
      lastReview = Get-NowIso
      lastEmail = $lastObservation
      processedCount = $nextTotal
      intervalSeconds = $IntervalSeconds
      observations = $allObservations
      error = $null
    })
  } catch {
    Write-JsonFile -Path $QueuePath -Value ([ordered]@{
      status = "Error"
      lastReview = Get-NowIso
      lastEmail = $queueLastEmail
      processedCount = $stateTotalProcessed
      intervalSeconds = $IntervalSeconds
      observations = $queueObservations
      error = $_.Exception.Message
    })
  }
}

Write-Host "G-OS Outlook Desktop Observer iniciado. Solo lectura. Intervalo: $IntervalSeconds segundos."
Write-Host "Cola local: $QueuePath"
Write-Host "Cerrar esta ventana detiene el observer."

do {
  Invoke-OutlookDesktopCycle
  if ($Once) { break }
  Start-Sleep -Seconds $IntervalSeconds
} while ($true)
