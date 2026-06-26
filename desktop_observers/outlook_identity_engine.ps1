param(
  [string]$IdentityPath = "",
  [switch]$NoMirror,
  [switch]$Silent
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
if (-not $IdentityPath) {
  $IdentityPath = Join-Path $ScriptDir "outlook_identity.json"
}
$MirrorPath = Join-Path $RepoRoot "app\desktop_observer\outlook_identity.json"

function Get-NowIso {
  return (Get-Date).ToUniversalTime().ToString("o")
}

function Write-JsonFile {
  param([string]$Path, [object]$Value)
  $dir = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
  }
  $json = $Value | ConvertTo-Json -Depth 14
  Set-Content -LiteralPath $Path -Value $json -Encoding UTF8
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

function Get-OutlookApplication {
  try {
    return [Runtime.InteropServices.Marshal]::GetActiveObject("Outlook.Application")
  } catch {
    throw "Outlook Desktop no esta abierto. Abrir Outlook y volver a calibrar."
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

function Get-StoreKind {
  param($Store)
  try {
    $type = [int]$Store.ExchangeStoreType
    switch ($type) {
      0 { return "ExchangeMailbox" }
      1 { return "ExchangePublicFolder" }
      2 { return "ExchangeDelegate" }
      3 { return "ExchangeArchive" }
      default { return "StoreType-$type" }
    }
  } catch {}
  try {
    $filePath = [string]$Store.FilePath
    if ($filePath.ToLowerInvariant().EndsWith(".pst")) { return "PST" }
    if ($filePath.ToLowerInvariant().EndsWith(".ost")) { return "OST" }
  } catch {}
  return "Desconocido"
}

function Get-StorePath {
  param($Store)
  try {
    $filePath = [string]$Store.FilePath
    if ($filePath) { return $filePath }
  } catch {}
  try {
    return [string]$Store.GetRootFolder().FolderPath
  } catch {
    return ""
  }
}

function Get-MailStats {
  param($Inbox)

  $now = Get-Date
  $today = $now.Date
  $hourAgo = $now.AddHours(-1)
  $sevenDays = $now.AddDays(-7)
  $thirtyDays = $now.AddDays(-30)
  $ninetyDays = $now.AddDays(-90)
  $items = $Inbox.Items
  $total = 0
  try { $total = [int]$items.Count } catch {}
  $max = [Math]::Min($total, 700)
  $latestMail = $null
  $latestTime = [datetime]::MinValue
  $todayCount = 0
  $hourCount = 0
  $sevenCount = 0
  $thirtyCount = 0

  for ($i = 1; $i -le $max; $i++) {
    try {
      $item = $items.Item($i)
      if (-not $item) { continue }
      if ([int]$item.Class -ne 43) { continue }
      $received = [datetime]$item.ReceivedTime
      if ($received -gt $latestTime) {
        $latestTime = $received
        $latestMail = $item
      }
      if ($received -ge $today) { $todayCount++ }
      if ($received -ge $hourAgo) { $hourCount++ }
      if ($received -ge $sevenDays) { $sevenCount++ }
      if ($received -ge $thirtyDays) { $thirtyCount++ }
    } catch {}
  }

  $subject = ""
  if ($latestMail) {
    try { $subject = [string]$latestMail.Subject } catch {}
  }

  return [pscustomobject]@{
    totalItems = $total
    latestMail = $subject
    latestTime = $latestTime
    latestTimeIso = if ($latestTime -gt [datetime]::MinValue) { $latestTime.ToUniversalTime().ToString("o") } else { "" }
    todayCount = $todayCount
    hourCount = $hourCount
    sevenCount = $sevenCount
    thirtyCount = $thirtyCount
    inactiveOver90Days = ($latestTime -gt [datetime]::MinValue -and $latestTime -lt $ninetyDays)
  }
}

function Get-ActivityScore {
  param([string]$StoreName, [string]$StoreKind, [string]$StorePath, $Stats)

  $score = 0
  $reasons = @()
  $lowerName = ($StoreName + "").ToLowerInvariant()
  $lowerPath = ($StorePath + "").ToLowerInvariant()

  if ($Stats.todayCount -gt 0) { $score += 100; $reasons += "+100 correo hoy" }
  if ($Stats.hourCount -gt 0) { $score += 60; $reasons += "+60 actividad ultima hora" }
  if ($Stats.sevenCount -gt 0) { $score += 40; $reasons += "+40 actividad ultimos 7 dias" }
  if ($Stats.thirtyCount -gt 0) { $score += 20; $reasons += "+20 actividad ultimos 30 dias" }
  if ($lowerName.Contains("archivo") -or $lowerName.Contains("archive") -or $StoreKind -eq "ExchangeArchive") { $score -= 150; $reasons += "-150 archivo" }
  if ($lowerPath.EndsWith(".pst") -or $StoreKind -eq "PST" -or $lowerName.Contains("historico") -or $lowerName.Contains("histórico")) { $score -= 120; $reasons += "-120 PST historico" }
  if ($Stats.totalItems -eq 0) { $score -= 80; $reasons += "-80 Inbox vacia" }
  if ($lowerName.Contains("(1)")) { $score -= 50; $reasons += "-50 Store duplicado" }
  if ($Stats.inactiveOver90Days) { $score -= 40; $reasons += "-40 sin actividad 90 dias" }

  return [pscustomobject]@{
    score = $score
    reasons = $reasons
  }
}

function Get-Confidence {
  param([int]$TopScore, [int]$SecondScore)
  $gap = $TopScore - $SecondScore
  if ($TopScore -ge 140 -and $gap -ge 40) { return "Alta" }
  if ($TopScore -ge 80 -and $gap -ge 20) { return "Media" }
  return "Baja"
}

function Invoke-OutlookIdentityCalibration {
  $outlook = Get-OutlookApplication
  $namespace = $outlook.GetNamespace("MAPI")
  $ranking = @()

  foreach ($store in @($namespace.Stores)) {
    $storeName = "Store sin nombre"
    $storeKind = "Desconocido"
    $storePath = ""
    try { $storeName = [string]$store.DisplayName } catch {}
    try { $storeKind = Get-StoreKind -Store $store } catch {}
    try { $storePath = Get-StorePath -Store $store } catch {}

    $record = [ordered]@{
      name = $storeName
      type = $storeKind
      path = $storePath
      inbox = ""
      totalItems = 0
      latestMail = ""
      latestMailDate = ""
      emailsToday = 0
      emailsLast7Days = 0
      emailsLast30Days = 0
      activityScore = -999
      reasons = @()
      error = ""
    }

    try {
      $inbox = Get-InboxFromStore -Store $store
      if (-not $inbox) {
        $record.error = "Inbox no encontrada"
        $record.reasons = @("-80 Inbox no encontrada")
        $record.activityScore = -80
        $ranking += [pscustomobject]$record
        continue
      }

      $stats = Get-MailStats -Inbox $inbox
      $score = Get-ActivityScore -StoreName $storeName -StoreKind $storeKind -StorePath $storePath -Stats $stats
      $record.inbox = [string]$inbox.FolderPath
      $record.totalItems = $stats.totalItems
      $record.latestMail = $stats.latestMail
      $record.latestMailDate = $stats.latestTimeIso
      $record.emailsToday = $stats.todayCount
      $record.emailsLast7Days = $stats.sevenCount
      $record.emailsLast30Days = $stats.thirtyCount
      $record.activityScore = $score.score
      $record.reasons = $score.reasons
    } catch {
      $record.error = $_.Exception.Message
    }

    $ranking += [pscustomobject]$record
  }

  $orderedRanking = @($ranking | Sort-Object { $_.activityScore } -Descending)
  $top = @($orderedRanking)[0]
  $second = @($orderedRanking)[1]
  $secondScore = if ($second) { [int]$second.activityScore } else { -999 }
  $confidence = if ($top) { Get-Confidence -TopScore ([int]$top.activityScore) -SecondScore $secondScore } else { "Baja" }
  $status = if ($confidence -eq "Alta") { "Estable" } elseif ($confidence -eq "Media") { "Aprendiendo" } else { "Inconsistente" }
  $reason = if ($top) { ($top.reasons -join "; ") } else { "No se encontraron Stores con Inbox" }
  $historyEntry = [ordered]@{
    timestamp = Get-NowIso
    selectedStore = if ($top) { $top.name } else { "" }
    selectedInbox = if ($top) { $top.inbox } else { "" }
    score = if ($top) { [int]$top.activityScore } else { 0 }
    confidence = $confidence
  }
  $previous = Read-JsonFile -Path $IdentityPath -Fallback $null
  $history = @($historyEntry)
  if ($previous -and $previous.activityHistory) {
    $history += @($previous.activityHistory)
  }
  $history = @($history | Select-Object -First 50)

  return [ordered]@{
    principalStore = if ($top) { $top.name } else { "" }
    principalInbox = if ($top) { $top.inbox } else { "" }
    principalAccount = if ($top) { $top.name } else { "" }
    confidence = $confidence
    status = $status
    score = if ($top) { [int]$top.activityScore } else { 0 }
    lastCalibration = Get-NowIso
    activityHistory = $history
    ranking = $orderedRanking
    selectionReason = $reason
    readOnly = $true
  }
}

try {
  $identity = Invoke-OutlookIdentityCalibration
  Write-JsonFile -Path $IdentityPath -Value $identity
  if (-not $NoMirror) {
    Write-JsonFile -Path $MirrorPath -Value $identity
  }
  if (-not $Silent) {
    Write-Host "Outlook Identity Engine calibrado."
    Write-Host "Store principal: $($identity.principalStore)"
    Write-Host "Inbox principal: $($identity.principalInbox)"
    Write-Host "Score: $($identity.score)"
    Write-Host "Confianza: $($identity.confidence)"
  }
} catch {
  $errorPayload = [ordered]@{
    principalStore = ""
    principalInbox = ""
    principalAccount = ""
    confidence = "Baja"
    status = "Inconsistente"
    score = 0
    lastCalibration = Get-NowIso
    activityHistory = @()
    ranking = @()
    selectionReason = "Error calibrando identidad: $($_.Exception.Message)"
    error = $_.Exception.Message
    readOnly = $true
  }
  Write-JsonFile -Path $IdentityPath -Value $errorPayload
  if (-not $NoMirror) {
    Write-JsonFile -Path $MirrorPath -Value $errorPayload
  }
  if (-not $Silent) {
    Write-Host $errorPayload.selectionReason
  }
  exit 1
}
