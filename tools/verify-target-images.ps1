$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $repoRoot 'data\image-manifest.json'
$manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
$missing = @()
$approved = 0
foreach ($property in $manifest.secondaryTargets.PSObject.Properties) {
    $entry = $property.Value
    if ($entry.status -eq 'approved' -and $entry.image) {
        $approved++
        $relative = $entry.image -replace '^\./', '' -replace '/', '\'
        $fullPath = Join-Path $repoRoot $relative
        if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
            $missing += [pscustomobject]@{ Id = $property.Name; Path = $relative }
        }
    }
}
Write-Host "Approved image entries: $approved"
if ($missing.Count -eq 0) {
    Write-Host 'All approved local image files are present.' -ForegroundColor Green
    exit 0
}
Write-Host "Missing image files: $($missing.Count)" -ForegroundColor Red
$missing | Format-Table -AutoSize
exit 1
