# Resizes source images into web-ready JPEGs.
# Usage: powershell -File tools\resize.ps1 -Src "C:\path\photo.png" -Name "my-image" -Widths 800,1600
# Writes assets\img\my-image-800.jpg and assets\img\my-image-1600.jpg (never upscales).
# Optional -Crop "x,y,w,h" crops the source (in source pixels) before resizing.
param(
  [Parameter(Mandatory)][string]$Src,
  [Parameter(Mandatory)][string]$Name,
  [int[]]$Widths = @(800, 1600),
  [int]$Quality = 82,
  [string]$Crop = ''
)
Add-Type -AssemblyName System.Drawing
$out = Join-Path $PSScriptRoot '..\assets\img'
$img = [Drawing.Image]::FromFile($Src)
$rect = New-Object Drawing.Rectangle 0, 0, $img.Width, $img.Height
if ($Crop) { $c = $Crop -split ',' | ForEach-Object { [int]$_ }; $rect = New-Object Drawing.Rectangle $c[0], $c[1], $c[2], $c[3] }
$codec = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object Drawing.Imaging.EncoderParameter ([Drawing.Imaging.Encoder]::Quality), ([long]$Quality)
foreach ($w in $Widths) {
  $tw = [math]::Min($w, $rect.Width)
  $th = [int][math]::Round($rect.Height * $tw / $rect.Width)
  $bmp = New-Object Drawing.Bitmap $tw, $th
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.Clear([Drawing.Color]::White)
  $g.InterpolationMode = 'HighQualityBicubic'; $g.SmoothingMode = 'HighQuality'; $g.PixelOffsetMode = 'HighQuality'; $g.CompositingQuality = 'HighQuality'
  $attr = New-Object Drawing.Imaging.ImageAttributes
  $attr.SetWrapMode([Drawing.Drawing2D.WrapMode]::TileFlipXY)
  $g.DrawImage($img, (New-Object Drawing.Rectangle 0, 0, $tw, $th), $rect.X, $rect.Y, $rect.Width, $rect.Height, [Drawing.GraphicsUnit]::Pixel, $attr)
  $file = Join-Path $out ("{0}-{1}.jpg" -f $Name, $w)
  $bmp.Save($file, $codec, $params)
  "{0}-{1}.jpg {2}x{3} {4}KB" -f $Name, $w, $tw, $th, [int]((Get-Item $file).Length / 1KB)
  $g.Dispose(); $bmp.Dispose()
}
$img.Dispose()
