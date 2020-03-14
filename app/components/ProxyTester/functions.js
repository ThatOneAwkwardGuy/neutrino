const rp = require('request-promise');
const HttpsProxyAgent = require('https-proxy-agent');
const { clipboard } = require('electron');

export const testProxy = async (proxyString, proxySite) => {
  const splitProxy = proxyString.split(':');
  let ip = '';
  let port = '';
  let user = '';
  let pass = '';
  let responsePing = { timings: { response: -1 } };
  if (splitProxy.length === 2) {
    [ip, port] = splitProxy;
  } else if (splitProxy.length === 4) {
    [ip, port, user, pass] = splitProxy;
  }
  try {
    const proxy =
      splitProxy.length === 4
        ? `http://${user}:${pass}@${ip}:${port}`
        : `http://${ip}:${port}`;
    responsePing = await rp({
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'max-age=0',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
      },
      method: 'GET',
      time: true,
      resolveWithFullResponse: true,
      uri: proxySite,
      agent: new HttpsProxyAgent(proxy),
      timeout: 60000
    });
    console.log(responsePing);
  } catch (error) {
    console.log(error);
    responsePing = { elapsedTime: -1 };
  }
  return {
    user,
    pass,
    ip,
    port,
    ping: Math.round(responsePing.elapsedTime)
  };
};

export const copyProxies = (proxies, maxPing) => {
  const filteredProxies = proxies.filter(proxy => proxy.ping <= maxPing);
  const proxyString = filteredProxies
    .map(proxy => {
      if (proxy.user !== 'none' && proxy.pass !== 'none') {
        return `${proxy.ip}:${proxy.port}:${proxy.user}:${proxy.pass}`;
      }
      return `${proxy.ip}:${proxy.port}`;
    })
    .join('\n');
  clipboard.writeText(proxyString, 'selection');
};
