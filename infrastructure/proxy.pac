// To test: https://app.thorsen.pm/proxyforurl
// Only proxy capco.dev requests
// Configuration file in ~/.symfony5/proxy.json
function FindProxyForURL(url, host) {
    if (host === 'capco.dev') {
        return 'PROXY localhost:7080';
    }
    return 'DIRECT';
}
