# Pixelates private details (names, emails, phone numbers) in a source image and saves a PNG copy.
# Usage: powershell -File tools\redact.ps1 -Src in.png -Out out.png -Rects "x,y,w,h;x,y,w,h"
# Then run tools\resize.ps1 on the output. Rectangles are in source pixels.
param(
  [Parameter(Mandatory)][string]$Src,
  [Parameter(Mandatory)][string]$Out,
  [Parameter(Mandatory)][string]$Rects,
  [int]$Block = 10
)
Add-Type -AssemblyName System.Drawing
$img = [Drawing.Image]::FromFile($Src)
$bmp = New-Object Drawing.Bitmap $img.Width, $img.Height
$g = [Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, $img.Width, $img.Height)
$img.Dispose()
foreach ($r in $Rects.Split(';')) {
  $v = $r.Split(',') | ForEach-Object { [int]$_ }
  $rect = New-Object Drawing.Rectangle $v[0], $v[1], $v[2], $v[3]
  $sw = [math]::Max(1, [int]($v[2] / $Block)); $sh = [math]::Max(1, [int]($v[3] / $Block))
  $small = New-Object Drawing.Bitmap $sw, $sh
  $sg = [Drawing.Graphics]::FromImage($small)
  $sg.InterpolationMode = 'HighQualityBilinear'
  $sg.DrawImage($bmp, (New-Object Drawing.Rectangle 0, 0, $sw, $sh), $rect, [Drawing.GraphicsUnit]::Pixel)
  $sg.Dispose()
  $g.InterpolationMode = 'NearestNeighbor'; $g.PixelOffsetMode = 'Half'
  $g.DrawImage($small, $rect, (New-Object Drawing.Rectangle 0, 0, $sw, $sh), [Drawing.GraphicsUnit]::Pixel)
  $small.Dispose()
}
$bmp.Save($Out, [Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
"redacted -> $Out"
