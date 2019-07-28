const { BrowserWindow, remote } = require('electron').remote;
const rp = require('request-promise').defaults({
  headers: {
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Safari/537.36'
  }
});
const cheerio = require('cheerio');

export const loadRaffleInfo = async (site, raffleLink) => {
  if (raffleLink !== '') {
    console.log(site);
    switch (site) {
      case 'DSML':
        return loadDSMLRaffleInfo(raffleLink);
      case 'Footpatrol UK':
        return loadFootpatrolUKRaffleInfo(raffleLink);
      case 'NakedCPH':
        return loadNakedCphRaffleInfo(raffleLink);
      case 'ExtraButter':
        return loadExtraButterRaffleInfo(raffleLink);
      case 'END':
        return loadEndRaffleInfo(raffleLink);
      case 'VooStore':
        return loadVooStoreRaffleInfo(raffleLink);
      case 'Bodega':
        return loadBodegaRaffleInfo(raffleLink);
      case 'OneBlockDown':
        return loadOneBlockDownRaffleInfo(raffleLink);
      default:
        return undefined;
    }
  }
};

export const bs = '';

const loadDSMLRaffleInfo = async link => {
  const win = new BrowserWindow({
    width: 500,
    height: 650,
    show: true,
    frame: true,
    resizable: true,
    focusable: true,
    minimizable: true,
    closable: true,
    allowRunningInsecureContent: true,
    webPreferences: {
      webviewTag: true,
      allowRunningInsecureContent: true,
      nodeIntegration: true,
      webSecurity: false
    }
  });
  win.loadURL(link);
  win.webContents.once('did-finish-load', () => {
    win.webContents.executeJavaScript('window.location.href', false, result => {
      if (result === link) {
        win.webContents.executeJavaScript(
          'document.documentElement.innerHTML',
          false,
          windowResult => {
            win.close();
            const $ = cheerio.load(windowResult);
            const styles = $('div[fs-field-validation-name="Colour"] option')
              .map((index, style) => ({
                id: style.attribs.value,
                name: style.attribs.value
              }))
              .toArray();
            const sizes = $('div[fs-field-validation-name="US Size"] option')
              .map((index, size) => ({
                id: size.attribs.value,
                name: size.attribs.value
              }))
              .toArray();
            const fullNameFormID = $(
              'div[fs-field-validation-name="Full Name"] input'
            ).attr('name');
            const emailFormID = $(
              'div[fs-field-validation-name="Email"] input'
            ).attr('name');
            const phoneFormID = $(
              'div[fs-field-validation-name="Mobile Phone Number"] input'
            ).attr('name');
            const postcodeFormID = $(
              'div[fs-field-validation-name="Postcode"] input'
            ).attr('name');
            return {
              styles,
              sizes,
              raffleDetails: {
                fullNameFormID,
                emailFormID,
                phoneFormID,
                postcodeFormID
              }
            };
          }
        );
      }
    });
  });
};

const loadNakedCphRaffleInfo = async link => {
  const win = createNewWindow('', '');
  win.loadURL(link);
  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript('window.location.href', false, result => {
      if (result === link) {
        win.webContents.executeJavaScript(
          'document.documentElement.innerHTML',
          false,
          innerHTML => {
            win.webContents.executeJavaScript(
              'window.rendererData',
              false,
              renderData => {
                let typeformCode = '';
                if (result.includes('nakedcph.typeform.com')) {
                  typeformCode = renderData.form.id;
                } else {
                  const $ = cheerio.load(innerHTML);
                  // eslint-disable-next-line prefer-destructuring
                  typeformCode = $('.typeform-widget')
                    .attr('data-url')
                    .split('/to/')[1];
                }
                win.close();
                return {
                  sizeInput: false,
                  styleInput: false,
                  raffleDetails: { typeformCode, renderData }
                };
              }
            );
          }
        );
      }
    });
  });
};

const loadFootpatrolUKRaffleInfo = async link => {
  const response = await rp.get(link);
  const $ = cheerio.load(response);
  const styles = $('select[name="shoeColor"] option:not([disabled])')
    .map((index, style) => ({
      id: style.attribs.value,
      name: style.attribs.value
    }))
    .toArray();
  const sizes = $('select[name="shoeSize"] option:not([disabled])')
    .map((index, size) => ({
      id: size.attribs.value,
      name: size.attribs.value
    }))
    .toArray();
  return {
    style: styles[0].id,
    size: sizes[0].id,
    styles,
    sizes
  };
};

const loadExtraButterRaffleInfo = async link => {
  const response = await rp.get(`${link.split('?')[0]}.json`);
  const raffleInfo = JSON.parse(response);
  const sizes = raffleInfo.product.variants.map(size => ({
    id: size.id,
    name: size.title
  }));
  return {
    styleInput: false,
    size: sizes[0].id.toString(),
    sizes,
    raffleDetails: { product: raffleInfo }
  };
};

const loadEndRaffleInfo = async link => {
  const splitLink = link.split('/');
  const apilink = `https://launches-api.endclothing.com/api/products/${
    splitLink[splitLink.length - 1]
  }`;
  const apiResponse = await rp({
    method: 'GET',
    json: true,
    uri: apilink
  });
  const sizes = apiResponse.productSizes.map(size => ({
    id: size.id,
    name: size.sizeDescription
  }));
  return {
    styleInput: false,
    sizeInput: true,
    sizes,
    size: sizes[0].id,
    raffleDetails: { product: apiResponse }
  };
};

const loadVooStoreRaffleInfo = async link => {
  const response = await rp.get(link);
  const $ = cheerio.load(response);
  const sizes = $('.shoes-sizen-mp>li[id]')
    .map((index, size) => ({
      id: size.attribs.id.split('_')[1],
      name: $(size).text()
    }))
    .toArray();
  const token = $('input[name="token"]').val();
  const pageID = $('input[name="page_id"]').val();
  return {
    styleInput: false,
    sizeInput: true,
    sizes,
    size: sizes[0].id,
    raffleDetails: { token, pageID }
  };
};

const loadBodegaRaffleInfo = async link => {
  const response = await rp.get(link);
  let $ = cheerio.load(response);
  const widgetCode = $('script[async=""]')
    .map((index, el) => el.attribs.src)
    .toArray()
    .find(src => src.includes('vsa-widget'))
    .match(/vsa-widget-(.*).js/)[1];
  const widgetBody = await rp.get(
    `https://app.viralsweep.com/vrlswp/widget/${widgetCode}?framed=1`
  );
  $ = cheerio.load(widgetBody);
  const sizeID = $('select:not([name=""])').attr('name');
  const sizes = $('option:not([value=""])')
    .map((index, el) => ({ id: el.attribs.value, name: el.attribs.value }))
    .toArray();
  return {
    styleInput: false,
    sizeInput: true,
    sizes,
    size: sizes[0].id,
    raffleDetails: { widgetCode, sizeID }
  };
};

const loadOneBlockDownRaffleInfo = async link =>
  new Promise((resolve, reject) => {
    const win = new BrowserWindow({
      width: 500,
      height: 650,
      show: true,
      frame: true,
      resizable: true,
      focusable: true,
      minimizable: true,
      closable: true,
      allowRunningInsecureContent: true,
      webPreferences: {
        webviewTag: true,
        allowRunningInsecureContent: true,
        nodeIntegration: true,
        webSecurity: false
      }
    });
    win.loadURL(link);
    win.webContents.once('did-finish-load', () => {
      win.webContents.executeJavaScript(
        'preloadedStock',
        false,
        preloadedStock => {
          win.webContents.executeJavaScript(
            `document.querySelector('#raffle-id').value`,
            false,
            raffleID => {
              if (preloadedStock) {
                const sizes = preloadedStock.map(size => ({
                  id: size.id,
                  name: size.variant
                }));
                win.close();
                resolve({
                  styleInput: false,
                  sizeInput: true,
                  sizes,
                  size: sizes[0].id,
                  raffleDetails: {
                    itemId: preloadedStock[0].itemId,
                    stockItemId: preloadedStock[0].stockItemId,
                    raffleID
                  }
                });
              }
              reject();
            }
          );
        }
      );
    });
  });

export const createNewWindow = async (tokenID, proxy) => {
  const win = new BrowserWindow({
    width: 500,
    height: 650,
    show: true,
    frame: true,
    resizable: true,
    focusable: true,
    minimizable: true,
    closable: true,
    webPreferences: {
      webviewTag: true,
      allowRunningInsecureContent: true,
      nodeIntegration: true,
      webSecurity: false,
      session: remote.session.fromPartition(`activity-${tokenID}`)
    }
  });
  if (proxy !== '' && proxy !== undefined) {
    await setProxyForWindow(proxy, win);
  }
  return win;
};

export const setProxyForWindow = async (proxy, win) =>
  new Promise(resolve => {
    const proxyArray = proxy.split(/@|:/);
    if (proxyArray.length === 4) {
      win.webContents.session.on(
        'login',
        (event, request, authInfo, callback) => {
          event.preventDefault();
          callback(proxyArray[0], proxyArray[1]);
        }
      );
    }
    const proxyIpAndPort = proxyArray.slice(-2);
    win.webContents.session.setProxy(
      { proxyRules: `${proxyIpAndPort[0]}:${proxyIpAndPort[1]},direct://` },
      () => {
        resolve();
      }
    );
  });
