[CmdletBinding()]
param(
    [string]$VideoPath,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

function Require-Command {
    param([Parameter(Mandatory = $true)][string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name was not found in PATH. Install ffmpeg and make sure both ffmpeg.exe and ffprobe.exe are available."
    }
}

function Get-EvenSize {
    param([Parameter(Mandatory = $true)][double]$Value)
    $rounded = [int][Math]::Round($Value)
    if (($rounded % 2) -ne 0) { $rounded-- }
    return [Math]::Max(2, $rounded)
}

function Get-EvenOffset {
    param([Parameter(Mandatory = $true)][double]$Value)
    $rounded = [int][Math]::Round($Value)
    if (($rounded % 2) -ne 0) { $rounded-- }
    return [Math]::Max(0, $rounded)
}

Require-Command -Name 'ffmpeg'
Require-Command -Name 'ffprobe'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$mapPath = Join-Path $repoRoot 'data\image-extraction-map.json'
$manifestPath = Join-Path $repoRoot 'data\image-manifest.json'

if (-not $VideoPath) { $VideoPath = Join-Path $repoRoot 'research-videos\sAd7OHSPPPA.mp4' }
if (-not (Test-Path -LiteralPath $VideoPath -PathType Leaf)) { throw "Source video not found: $VideoPath" }
if (-not (Test-Path -LiteralPath $mapPath -PathType Leaf)) { throw "Extraction map not found: $mapPath" }
if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) { throw "Image manifest not found: $manifestPath" }

$map = Get-Content -LiteralPath $mapPath -Raw -Encoding UTF8 | ConvertFrom-Json
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json

$probeOutput = & ffprobe -v error -select_streams 'v:0' -show_entries 'stream=width,height' -of json "$VideoPath"
if ($LASTEXITCODE -ne 0) { throw 'ffprobe could not read the source video.' }
$probe = $probeOutput | ConvertFrom-Json
if (-not $probe.streams -or $probe.streams.Count -lt 1) { throw "No video stream was found in $VideoPath" }

$sourceWidth = [int]$probe.streams[0].width
$sourceHeight = [int]$probe.streams[0].height
$referenceWidth = [double]$map.referenceResolution.width
$referenceHeight = [double]$map.referenceResolution.height

Write-Host "Source: $VideoPath"
Write-Host "Resolution: ${sourceWidth}x${sourceHeight}"
Write-Host "Targets in this approved batch: $($map.entries.Count)"
Write-Host ''

$completed = New-Object System.Collections.Generic.List[string]
foreach ($entry in $map.entries) {
    $relativeOutput = [string]$entry.output
    $outputPath = Join-Path $repoRoot ($relativeOutput -replace '/', '\')
    $outputDirectory = Split-Path -Parent $outputPath
    New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

    $cropWidth = Get-EvenSize ($sourceWidth * ([double]$entry.crop.width / $referenceWidth))
    $cropHeight = Get-EvenSize ($sourceHeight * ([double]$entry.crop.height / $referenceHeight))
    $cropX = Get-EvenOffset ($sourceWidth * ([double]$entry.crop.x / $referenceWidth))
    $cropY = Get-EvenOffset ($sourceHeight * ([double]$entry.crop.y / $referenceHeight))
    if (($cropX + $cropWidth) -gt $sourceWidth) { $cropWidth = Get-EvenSize ($sourceWidth - $cropX) }
    if (($cropY + $cropHeight) -gt $sourceHeight) { $cropHeight = Get-EvenSize ($sourceHeight - $cropY) }

    $filter = "crop=${cropWidth}:${cropHeight}:${cropX}:${cropY},scale='min(1200,iw)':-2:flags=lanczos"
    if ($Force -or -not (Test-Path -LiteralPath $outputPath -PathType Leaf)) {
        Write-Host "Extracting $($entry.name) [$($entry.timestamp)]..."
        & ffmpeg -nostdin -hide_banner -loglevel error -y -ss ([string]$entry.timestamp) -i "$VideoPath" -frames:v 1 -vf "$filter" -c:v libwebp -q:v 85 -compression_level 6 -preset picture "$outputPath"
        if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $outputPath -PathType Leaf)) { throw "Extraction failed for $($entry.id)" }
    } else {
        Write-Host "Keeping existing file for $($entry.name)"
    }

    if ([string]$entry.kind -eq 'primary') { $record = $manifest.primaryTargets.([string]$entry.id) }
    else { $record = $manifest.secondaryTargets.([string]$entry.id) }
    if ($null -eq $record) { throw "Target $($entry.id) is missing from data/image-manifest.json" }

    $record.image = './' + $relativeOutput.Replace('\', '/')
    $record.status = 'approved'
    $record.sourceVideo = [string]$map.source.url
    $record.timestamp = [string]$entry.timestamp
    $record.notes = "Local 4K extraction. Frame $($entry.frame). Quality $($entry.quality). $($entry.verification)"
    $completed.Add([string]$entry.id)
}

$manifest.version = '1.1.0'
$manifest.notes = 'Local target image manifest. Entries marked approved were generated from the verified extraction map.'
$manifestJson = $manifest | ConvertTo-Json -Depth 20
[System.IO.File]::WriteAllText($manifestPath, $manifestJson + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))

Write-Host ''
Write-Host "Completed: $($completed.Count) local target images"
Write-Host 'Updated: data\image-manifest.json'
Write-Host ''
Write-Host 'Next commands:'
Write-Host '  git add assets/images/targets data/image-manifest.json data/image-extraction-map.json IMAGE_SOURCES.md tools'
Write-Host '  git commit -m "Add first verified local target images"'
Write-Host '  git push'
