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
$TargetAccount = "guillermo.weinstein@mercadoforestal.com.uy"

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
    sender = $senderName
    senderEmail = $senderEmail
    bodyPreview = $bodyPreview
    folder = $FolderPath
    entryId = $entryId
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

function Get-InboxFromStore {
  param($Store)
  try {
    return $Store.GetDefaultFolder(6)
  } catch {
    try {
      $root = $Store.GetRootFolder()
      foreach ($folder in @($root.Folders)) {
        if ([string]$folder.Name -in @("Inbox", "Bandeja de entrada")) {
          return $folder
        }
      }
    } catch {}
  }
  return $null
}

function Get-IdentityInboxContext {
  param($Namespace)

  $store = $null
  foreach ($candidate in @($Namespace.Stores)) {
    try {
      if ([string]$candidate.DisplayName -eq $TargetAccount) {
        $store = $candidate
        break
      }
    } catch {}
  }

  if (-not $store) {
    return [pscustomobject]@{
      Valid = $false
      Identity = $null
      Store = $null
      Inbox = $null
      Calibrated = $false
      Reason = "Cuenta principal no encontrada."
    }
  }

  $inbox = Get-InboxFromStore -Store $store
  if (-not $inbox) {
    return [pscustomobject]@{
      Valid = $false
      Identity = $null
      Store = $store
      Inbox = $null
      Calibrated = $false
      Reason = "Bandeja de entrada no encontrada para la cuenta principal."
    }
  }

  $identity = [pscustomobject]@{
    principalStore = $TargetAccount
    principalInbox = [string]$inbox.FolderPath
    principalAccount = $TargetAccount
    observedAccount = $TargetAccount
    observedInbox = "Bandeja de entrada"
    status = "Conectado"
    lastCalibration = Get-NowIso
    selectionReason = "Cuenta principal configurada."
    readOnly = $true
  }

  return [pscustomobject]@{
    Valid = $true
    Identity = $identity
    Store = $store
    Inbox = $inbox
    Calibrated = $false
    Reason = "Cuenta principal configurada."
  }
}

function Get-RecentInboxMail {
  $outlook = Get-OutlookApplication
  $namespace = $outlook.GetNamespace("MAPI")
  $messages = @()
  $debugStores = @()
  $latestObservation = $null
  $identityContext = Get-IdentityInboxContext -Namespace $namespace

  if (-not $identityContext.Valid) {
    Write-Host $identityContext.Reason
    throw $identityContext.Reason
  }

  Write-Host "Cuenta observada: $TargetAccount"
  Write-Host "Inbox: $($identityContext.Identity.principalInbox)"

  $storesToReview = @([pscustomobject]@{
    Store = $identityContext.Store
    Inbox = $identityContext.Inbox
    IdentityUsed = $true
  })

  foreach ($review in @($storesToReview)) {
    $store = $review.Store
    $storeName = "Store sin nombre"
    try { $storeName = [string]$store.DisplayName } catch {}
    Write-Host "Store: $storeName"

    $storeDebug = [ordered]@{
      storeName = $storeName
      inboxFound = $false
      inboxPath = ""
      totalItems = 0
      latestSubject = ""
      latestReceivedTime = ""
      reasonIfSkipped = ""
      identityUsed = [bool]$review.IdentityUsed
    }

    try {
      $inbox = if ($review.Inbox) { $review.Inbox } else { Get-InboxFromStore -Store $store }
      if (-not $inbox) {
        $storeDebug.reasonIfSkipped = "Inbox no encontrada"
        Write-Host "  Inbox: no encontrada"
        $debugStores += $storeDebug
        continue
      }

      $items = $inbox.Items
      $folderPath = [string]$inbox.FolderPath
      $storeDebug.inboxFound = $true
      $storeDebug.inboxPath = $folderPath
      $storeDebug.totalItems = [int]$items.Count
      Write-Host "  Inbox: $folderPath"
      Write-Host "  Items: $($items.Count)"

      $storeMessages = @()
      $max = [Math]::Min($items.Count, 200)
      for ($i = 1; $i -le $max; $i++) {
        try {
          $item = $items.Item($i)
          if (-not $item) { continue }
          if ([int]$item.Class -ne 43) { continue }

          $receivedTime = [datetime]::MinValue
          try { $receivedTime = [datetime]$item.ReceivedTime } catch {}
          $mailRecord = [pscustomobject]@{
            Mail = $item
            FolderPath = $folderPath
            StoreName = $storeName
            ReceivedTime = $receivedTime
          }
          $storeMessages += $mailRecord
        } catch {
          Write-Host "  Item omitido: $($_.Exception.Message)"
        }
      }

      $storeMessages = $storeMessages | Sort-Object { $_.ReceivedTime } -Descending
      $latestStoreMessage = @($storeMessages)[0]
      if ($latestStoreMessage) {
        try { $storeDebug.latestSubject = [string]$latestStoreMessage.Mail.Subject } catch {}
        try { $storeDebug.latestReceivedTime = ([datetime]$latestStoreMessage.Mail.ReceivedTime).ToUniversalTime().ToString("o") } catch {}
        Write-Host "  Ultimo correo: $($storeDebug.latestSubject)"
        Write-Host "  Fecha ultimo: $($storeDebug.latestReceivedTime)"
      }

      $messages += @($storeMessages | Select-Object -First 50)

      if (-not $latestObservation -and $latestStoreMessage) {
        $latestObservation = Convert-MailToObservation -Mail $latestStoreMessage.Mail -FolderPath $folderPath
      }
    } catch {
      $storeDebug.reasonIfSkipped = $_.Exception.Message
      Write-Host "  Error: $($storeDebug.reasonIfSkipped)"
    }

    $debugStores += $storeDebug
  }

  $messages = $messages | Sort-Object {
    try { [datetime]$_.ReceivedTime } catch { [datetime]::MinValue }
  } -Descending

  $latestGlobalMessage = @($messages)[0]
  if ($latestGlobalMessage) {
    $latestObservation = Convert-MailToObservation -Mail $latestGlobalMessage.Mail -FolderPath $latestGlobalMessage.FolderPath
  }

  $totalItems = 0
  foreach ($debugStore in $debugStores) {
    try { $totalItems += [int]$debugStore.totalItems } catch {}
  }

  return [pscustomobject]@{
    Messages = @($messages)
    LatestObservation = $latestObservation
    Debug = [ordered]@{
      storesChecked = @($debugStores | ForEach-Object { $_.storeName })
      inboxesFound = @($debugStores | Where-Object { $_.inboxFound } | ForEach-Object { $_.inboxPath })
      totalItems = $totalItems
      latestSubject = if ($latestObservation) { $latestObservation.title } else { "" }
      latestReceivedTime = if ($latestObservation) { $latestObservation.timestamp } else { "" }
      reasonIfSkipped = ($debugStores | Where-Object { $_.reasonIfSkipped } | ForEach-Object { "$($_.storeName): $($_.reasonIfSkipped)" }) -join "; "
      stores = $debugStores
      identity = [ordered]@{
        used = [bool]$identityContext.Valid
        principalStore = $(if ($identityContext.Identity) { $identityContext.Identity.principalStore } else { "" })
        principalInbox = $(if ($identityContext.Identity) { $identityContext.Identity.principalInbox } else { "" })
        principalAccount = $(if ($identityContext.Identity) { $identityContext.Identity.principalAccount } else { "" })
        observedAccount = $TargetAccount
        observedInbox = "Bandeja de entrada"
        status = $(if ($identityContext.Identity) { $identityContext.Identity.status } else { "" })
        lastCalibration = $(if ($identityContext.Identity) { $identityContext.Identity.lastCalibration } else { "" })
        error = ""
      }
    }
  }
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
  $queueDebug = $queue.debug

  try {
    $scan = Get-RecentInboxMail
    $messages = @($scan.Messages)
    $debug = $scan.Debug
    $latestObservation = $scan.LatestObservation
    $known = @{}
    foreach ($id in @($state.processedEntryIds)) {
      if ($id) { $known[[string]$id] = $true }
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

    if ($stateTotalProcessed -eq 0 -and $newObservations.Count -eq 0 -and $latestObservation) {
      $testEntryId = [string]$latestObservation.entryId
      if ($testEntryId) {
        Write-Host "Modo diagnostico: importando ultimo correo como observacion de prueba."
        $latestObservation.metadata.diagnosticFirstRun = $true
        $newObservations += $latestObservation
        $known[$testEntryId] = $true
      }
    }

    $allObservations = @($queue.observations) + $newObservations
    if ($allObservations.Count -gt 100) {
      $allObservations = $allObservations | Select-Object -Last 100
    }

    $lastObservation = if ($newObservations.Count) { $newObservations[-1] } elseif ($latestObservation) { $latestObservation } else { $queueLastEmail }
    $nextTotal = $stateTotalProcessed + $newObservations.Count
    $latestObservationId = if ($lastObservation) { $lastObservation.id } else { "" }

    Write-JsonFile -Path $StatePath -Value ([ordered]@{
      initialized = $true
      processedEntryIds = @($known.Keys | Select-Object -Last 500)
      totalProcessed = $nextTotal
      lastObservationId = $latestObservationId
      lastCycleAt = Get-NowIso
    })
    Write-JsonFile -Path $QueuePath -Value ([ordered]@{
      status = "Activo"
      lastReview = Get-NowIso
      lastEmail = $lastObservation
      processedCount = $nextTotal
      newObservationCount = $newObservations.Count
      latestObservationId = $latestObservationId
      queueUpdatedAt = Get-NowIso
      intervalSeconds = $IntervalSeconds
      observations = $allObservations
      debug = $debug
      identity = $debug.identity
      error = $null
    })
  } catch {
    Write-JsonFile -Path $QueuePath -Value ([ordered]@{
      status = "Error"
      lastReview = Get-NowIso
      lastEmail = $queueLastEmail
      processedCount = $stateTotalProcessed
      newObservationCount = 0
      latestObservationId = ""
      queueUpdatedAt = Get-NowIso
      intervalSeconds = $IntervalSeconds
      observations = $queueObservations
      debug = $queueDebug
      identity = [ordered]@{
        used = $false
        principalStore = ""
        principalInbox = ""
        principalAccount = ""
        observedAccount = $TargetAccount
        observedInbox = "Bandeja de entrada"
        status = "Error"
        lastCalibration = Get-NowIso
        error = $_.Exception.Message
      }
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
