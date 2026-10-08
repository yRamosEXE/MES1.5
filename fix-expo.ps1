$ErrorActionPreference = 'Stop'

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]::new($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Este script precisa de privilégios de administrador para configurar o Firewall. Abra o VS Code como Administrador e execute-o novamente.'
}

$ports = @(8081, 8082)
$portSpec = $ports -join ','
$hasNonNodeListener = $false
$firewallRules = @(
    @{ DisplayName = 'MES1.5 Expo Metro Inbound 8081-8082'; Direction = 'Inbound'; PortParameter = 'LocalPort' },
    @{ DisplayName = 'MES1.5 Expo Metro Outbound 8081-8082'; Direction = 'Outbound'; PortParameter = 'RemotePort' }
)

Write-Host '[1/5] Stopping only node.exe processes listening on Metro ports...' -ForegroundColor Cyan
$listeners = @(Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $ports -contains $_.LocalPort })
$listenerProcessIds = @($listeners | Select-Object -ExpandProperty OwningProcess -Unique)
foreach ($processId in $listenerProcessIds) {
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($null -eq $process) { continue }

    if ($process.ProcessName -ieq 'node') {
        Write-Host ('  Stopping node.exe PID {0} (port 8081/8082).' -f $processId) -ForegroundColor Yellow
        Stop-Process -Id $processId -Force
    } else {
        $hasNonNodeListener = $true
        Write-Warning ('Port is owned by non-Node process {0} (PID {1}); leaving it untouched.' -f $process.ProcessName, $processId)
    }
}
if ($hasNonNodeListener) {
    throw 'A non-Node process is using 8081 or 8082. Close that process, then run fix-expo.ps1 again.'
}

Write-Host '[2/5] Configuring inbound and outbound TCP firewall rules...' -ForegroundColor Cyan
foreach ($rule in $firewallRules) {
    Get-NetFirewallRule -DisplayName $rule.DisplayName -ErrorAction SilentlyContinue |
        Remove-NetFirewallRule -ErrorAction SilentlyContinue

    $parameters = @{
        DisplayName = $rule.DisplayName
        Direction = $rule.Direction
        Action = 'Allow'
        Protocol = 'TCP'
        Profile = 'Any'
        Enabled = 'True'
    }
    $parameters[$rule.PortParameter] = $portSpec
    New-NetFirewallRule @parameters | Out-Null
    Write-Host ('  Rule "{0}" applied for TCP {1}.' -f $rule.DisplayName, $portSpec) -ForegroundColor Green
}

Write-Host '[3/5] Finding IPv4 on an active physical network adapter...' -ForegroundColor Cyan
$excludedAdapterPattern = '(?i)(vEthernet|WSL|Hyper-V|VirtualBox|VMware|Virtual|TAP-Windows|TUN|Loopback)'
$physicalAdapters = @(
    Get-NetAdapter -Physical -ErrorAction Stop |
        Where-Object {
            $_.Status -eq 'Up' -and
            $_.Name -match '(?i)(Wi-?Fi|Wireless|WLAN|Ethernet|LAN)' -and
            $_.Name -notmatch $excludedAdapterPattern -and
            $_.InterfaceDescription -notmatch $excludedAdapterPattern
        }
)
$defaultRoutes = @(Get-NetRoute -AddressFamily IPv4 -DestinationPrefix '0.0.0.0/0' -ErrorAction SilentlyContinue)
$candidates = @(
    foreach ($adapter in $physicalAdapters) {
        $adapterRoutes = @($defaultRoutes | Where-Object { $_.InterfaceIndex -eq $adapter.ifIndex })
        $bestRouteMetric = if ($adapterRoutes.Count -gt 0) {
            ($adapterRoutes | Measure-Object -Property RouteMetric -Minimum).Minimum
        } else {
            [int]::MaxValue
        }

        $addresses = @(
            Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex $adapter.ifIndex -ErrorAction SilentlyContinue |
                Where-Object {
                    $_.AddressState -eq 'Preferred' -and
                    $_.IPAddress -notmatch '^(169\.254\.|127\.|0\.)'
                }
        )

        foreach ($address in $addresses) {
            [pscustomobject]@{
                AdapterName = $adapter.Name
                InterfaceDescription = $adapter.InterfaceDescription
                InterfaceIndex = $adapter.ifIndex
                IPv4Address = $address.IPAddress
                HasDefaultRoute = ($adapterRoutes.Count -gt 0)
                RouteMetric = $bestRouteMetric
            }
        }
    }
)

$selectedAddress = $candidates |
    Sort-Object @{ Expression = 'HasDefaultRoute'; Descending = $true }, @{ Expression = 'RouteMetric'; Ascending = $true } |
    Select-Object -First 1

if ($null -eq $selectedAddress) {
    throw 'Nenhum IPv4 utilizável foi encontrado em uma interface Wi-Fi/Ethernet física ativa. Conecte-se à rede e execute o script novamente.'
}

if (-not $selectedAddress.HasDefaultRoute) {
    Write-Warning 'The physical adapter has no default IPv4 route; LAN routing or firewall may still block the device.'
}

Write-Host ('  Adapter: {0} - {1}' -f $selectedAddress.AdapterName, $selectedAddress.InterfaceDescription) -ForegroundColor Green
Write-Host ('  Selected IPv4: {0}' -f $selectedAddress.IPv4Address) -ForegroundColor Green

Write-Host '[4/5] Setting REACT_NATIVE_PACKAGER_HOSTNAME for this process...' -ForegroundColor Cyan
$env:REACT_NATIVE_PACKAGER_HOSTNAME = $selectedAddress.IPv4Address
Write-Host ('  REACT_NATIVE_PACKAGER_HOSTNAME=' + $env:REACT_NATIVE_PACKAGER_HOSTNAME) -ForegroundColor Green

Write-Host '[5/5] Clearing Metro cache and starting Expo in LAN mode...' -ForegroundColor Cyan
Set-Location $PSScriptRoot
if (-not (Test-Path (Join-Path $PSScriptRoot 'package.json'))) {
    throw 'package.json not found. Place fix-expo.ps1 in the MES1.5_mobile project root.'
}

npx expo start --lan --clear