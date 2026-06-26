param(
  [int]$Port = 17829,
  [string]$QueuePath = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($QueuePath)) {
  $scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
  $projectRoot = Split-Path -Parent $scriptRoot
  $QueuePath = Join-Path $projectRoot "app\desktop_observer\outlook_desktop_queue.json"
}

$prefix = "http://localhost:$Port/"
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)

function Write-JsonResponse {
  param(
    [System.Net.HttpListenerContext]$Context,
    [int]$StatusCode,
    [string]$Json
  )

  $Context.Response.StatusCode = $StatusCode
  $Context.Response.ContentType = "application/json; charset=utf-8"
  $Context.Response.Headers.Add("Access-Control-Allow-Origin", "*")
  $Context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS")
  $Context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Json)
  $Context.Response.ContentLength64 = $bytes.Length
  $Context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $Context.Response.OutputStream.Close()
}

try {
  $listener.Start()
  Write-Host "G-OS Local Bridge activo en $prefix"
  Write-Host "Endpoint: http://localhost:$Port/outlook/queue"
  Write-Host "Cola: $QueuePath"
  Write-Host "Modo: solo lectura. Ctrl+C para detener."

  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $path = $context.Request.Url.AbsolutePath

    if ($context.Request.HttpMethod -eq "OPTIONS") {
      Write-JsonResponse -Context $context -StatusCode 204 -Json ""
      continue
    }

    if ($path -ne "/outlook/queue") {
      Write-JsonResponse -Context $context -StatusCode 404 -Json '{"status":"Error","error":"Endpoint no encontrado"}'
      continue
    }

    if (-not (Test-Path -LiteralPath $QueuePath)) {
      $payload = @{
        status = "Esperando"
        error = $null
        bridge = "gos_local_bridge"
        message = "Cola local no encontrada. Ejecutar Outlook Desktop Observer."
        lastReview = (Get-Date).ToUniversalTime().ToString("o")
        observations = @()
      } | ConvertTo-Json -Depth 8
      Write-JsonResponse -Context $context -StatusCode 200 -Json $payload
      continue
    }

    $json = Get-Content -LiteralPath $QueuePath -Raw -Encoding UTF8
    Write-JsonResponse -Context $context -StatusCode 200 -Json $json
  }
}
catch {
  Write-Host "G-OS Local Bridge error: $($_.Exception.Message)"
  exit 1
}
finally {
  if ($listener.IsListening) {
    $listener.Stop()
  }
  $listener.Close()
}
