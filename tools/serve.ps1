# Minimal static file server for local preview (no installs needed).
# Usage: powershell -File tools\serve.ps1 [-Port 8080]   then open http://localhost:8080/
param([int]$Port = 8080)
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$types = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.svg'='image/svg+xml'; '.png'='image/png'; '.jpg'='image/jpeg'; '.pdf'='application/pdf'; '.xml'='application/xml'; '.txt'='text/plain; charset=utf-8'; '.json'='application/json' }
$listener = New-Object Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try {
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ($path -eq '' -or $path.EndsWith('/')) { $path += 'index.html' }
    $file = [IO.Path]::GetFullPath((Join-Path $root $path))
    if (-not $file.StartsWith($root) -or -not (Test-Path $file -PathType Leaf)) {
      $ctx.Response.StatusCode = 404; $file = Join-Path $root '404.html'
    }
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $ctx.Response.ContentType = if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' }
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    Write-Host ("{0} {1}" -f $ctx.Response.StatusCode, $ctx.Request.Url.AbsolutePath)
  } catch { Write-Host "error: $_" } finally { $ctx.Response.Close() }
}
