$sourcePath = "d:\Blog\orange\public\images\毛毛痛车"
$destPath = "d:\Blog\orange\public\images\itasha"

$files = @{
    "乱.png" = "mess.png"
    "开始.jpg" = "start.jpg"
    "数据.png" = "data.png"
    "毛毛.png" = "momo.png"
    "素材.jpg" = "material.jpg"
    "草稿.jpg" = "draft.jpg"
}

foreach ($file in $files.GetEnumerator()) {
    $sourceFile = Join-Path $sourcePath $file.Key
    $destFile = Join-Path $destPath $file.Value
    Copy-Item $sourceFile $destFile -Force
    Write-Host "Copied $($file.Key) to $($file.Value)"
}

Write-Host "All files copied successfully!"