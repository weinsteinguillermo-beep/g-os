param(
  [string]$IdentityPath = "",
  [switch]$NoMirror,
  [switch]$Silent
)

$ErrorActionPreference = "Stop"

$TargetAccount = "guillermo.weinstein@mercadoforestal.com.uy"
$TargetInboxName = "Bandeja de entrada"

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
  $json = $Value | ConvertTo-Json -Depth 10
  Set-Content -LiteralPath $Path -Value $json -Encoding UTF8
}

function Get-OutlookApplication {
  try {
    return [Runtime.InteropServices.Marshal]::GetActiveObject("Outlook.Application")
  } catch {
    throw "Outlook Desktop no esta abierto. Abrir Outlook y volver a verificar la cuenta principal."
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

function New-IdentityPayload {
  param(
    [bool]$Found,
    [string]$InboxPath,
    [string]$Status,
    [string]$ErrorMessage = ""
  )

  return [ordered]@{
    principalStore = $(if ($Found) { $TargetAccount } else { "" })
    principalInbox = $(if ($Found) { $InboxPath } else { "" })
    principalAccount = $(if ($Found) { $TargetAccount } else { "" })
    observedAccount = $TargetAccount
    observedInbox = $TargetInboxName
    status = $Status
    lastCalibration = Get-NowIso
    selectionReason = $(if ($Found) { "Cuenta principal configurada encontrada." } else { "Cuenta principal no encontrada." })
    error = $ErrorMessage
    readOnly = $true
  }
}

function Resolve-FixedOutlookIdentity {
  $outlook = Get-OutlookApplication
  $namespace = $outlook.GetNamespace("MAPI")

  foreach ($store in @($namespace.Stores)) {
    $storeName = ""
    try { $storeName = [string]$store.DisplayName } catch {}
    if ($storeName -ne $TargetAccount) { continue }

    $inbox = Get-InboxFromStore -Store $store
    if (-not $inbox) {
      return New-IdentityPayload -Found $false -InboxPath "" -Status "Error" -ErrorMessage "Bandeja de entrada no encontrada para la cuenta principal."
    }

    return New-IdentityPayload -Found $true -InboxPath ([string]$inbox.FolderPath) -Status "Conectado"
  }

  return New-IdentityPayload -Found $false -InboxPath "" -Status "Cuenta principal no encontrada" -ErrorMessage "Cuenta principal no encontrada."
}

try {
  $identity = Resolve-FixedOutlookIdentity
  Write-JsonFile -Path $IdentityPath -Value $identity
  if (-not $NoMirror) {
    Write-JsonFile -Path $MirrorPath -Value $identity
  }
  if (-not $Silent) {
    Write-Host "Outlook Identity Engine verificado."
    Write-Host "Cuenta observada: $TargetAccount"
    Write-Host "Estado: $($identity.status)"
    Write-Host "Inbox: $($identity.principalInbox)"
  }
  if ($identity.error) { exit 1 }
} catch {
  $errorPayload = New-IdentityPayload -Found $false -InboxPath "" -Status "Error" -ErrorMessage $_.Exception.Message
  Write-JsonFile -Path $IdentityPath -Value $errorPayload
  if (-not $NoMirror) {
    Write-JsonFile -Path $MirrorPath -Value $errorPayload
  }
  if (-not $Silent) {
    Write-Host $errorPayload.error
  }
  exit 1
}
