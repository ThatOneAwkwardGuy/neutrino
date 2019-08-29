const { BrowserWindow } = require('electron').remote;
const cheerio = require('cheerio');
const rp = require('request-promise').defaults({
  headers: {
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Safari/537.36'
  }
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const loadRaffleInfo = async (site, raffleLink) => {
  if (raffleLink !== '') {
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
      // case 'Kickz':
      // return loadKickzRaffleInfo(raffleLink);
      case 'CityBlue':
        return loadCityBlueRaffleInfo(raffleLink);
      case 'LapstoneAndHammer':
        return loadLapstoneAndHammerRaffleInfo(raffleLink);
      case 'BSTN':
        return loadBSTNRaffleInfo(raffleLink);
      default:
        return undefined;
    }
  }
};

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
  const win = await createNewWindow('', '');
  win.loadURL(link);
  return new Promise((resolve, reject) => {
    try {
      win.webContents.on('close', () => {
        reject(new Error('Closed Window Before Finished'));
      });
      win.webContents.on('dom-ready', async () => {
        const currentURL = await win.webContents.executeJavaScript(
          'window.location.href',
          false
        );
        if (currentURL === link) {
          const innerHTML = await win.webContents.executeJavaScript(
            'document.documentElement.innerHTML',
            false
          );
          let renderData = await win.webContents.executeJavaScript(
            'window.rendererData',
            true
          );
          let typeformCode;
          if (currentURL.includes('nakedcph.typeform.com')) {
            typeformCode = renderData.form.id;
          } else {
            const $ = cheerio.load(innerHTML);
            // eslint-disable-next-line prefer-destructuring
            typeformCode = $('.typeform-widget')
              .attr('data-url')
              .split('/to/')[1];
          }
          if (!currentURL.includes('nakedcph.typeform.com')) {
            win.loadURL(
              `https://nakedcph.typeform.com/to/${typeformCode}?typeform-embed=embed-widget`
            );
            win.webContents.on('dom-ready', async () => {
              renderData = await win.webContents.executeJavaScript(
                'window.rendererData',
                true
              );
              resolve({
                sizeInput: false,
                styleInput: false,
                raffleDetails: { typeformCode, renderData }
              });
              win.close();
            });
          } else {
            resolve({
              sizeInput: false,
              styleInput: false,
              raffleDetails: { typeformCode, renderData }
            });
            win.close();
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const loadFootpatrolUKRaffleInfo = async link =>
  new Promise((resolve, reject) => {
    try {
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
      win.webContents.on('close', () => {
        reject(new Error('Closed Window Before Finished'));
      });
      win.loadURL(link);
      win.webContents.once('dom-ready', async () => {
        await sleep(3000);
        win.webContents.executeJavaScript(
          'document.documentElement.innerHTML',
          false,
          innerHTML => {
            const $ = cheerio.load(innerHTML);
            const styles = $(
              'select[placeholder="Colour"] option:not([disabled])'
            )
              .map((index, style) => ({
                id: style.attribs.value,
                name: style.children[0].data
              }))
              .toArray();
            const sizes = $(
              'select[placeholder="Shoe Size (UK/EU)"] option:not([disabled])'
            )
              .map((index, size) => ({
                id: size.attribs.value,
                name: size.attribs.value
              }))
              .toArray();
            const title = $('#title')
              .contents()
              .first()
              .text();
            win.close();
            resolve({
              style: styles[0].id,
              size: sizes[0].id,
              styles,
              sizes,
              raffleDetails: {
                title
              }
            });
          }
        );
      });
    } catch (e) {
      reject(e);
    }
  });

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
    try {
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
      win.webContents.on('close', () => {
        reject(new Error('Closed Window Before Finished'));
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
                reject(new Error('Unable to find OneBlockDown Raffle Details'));
              }
            );
          }
        );
      });
    } catch (error) {
      reject(error);
    }
  });

// const loadKickzRaffleInfo = raffleLink => {};

const loadCityBlueRaffleInfo = async link => {
  const response = await rp.get(link);
  const $ = cheerio.load(response);
  const formLink = $('#mc_embed_signup form').attr('action');
  const id = $('#mc_embed_signup_scroll > div[aria-hidden=true] input').attr(
    'name'
  );
  const sizes = $('select[name="MMERGE3"] option:not([value=""])')
    .map((index, el) => ({ id: el.attribs.value, name: el.attribs.value }))
    .toArray();
  return {
    styleInput: false,
    sizeInput: true,
    sizes,
    size: sizes[0].id,
    raffleDetails: {
      formLink,
      id
    }
  };
};

const loadLapstoneAndHammerRaffleInfo = async link => {
  const response = await rp.get(link);
  const $ = cheerio.load(response);
  const formLink = $('#mc_embed_signup form').attr('action');
  const id = $('#mc_embed_signup_scroll > div[aria-hidden=true] input').attr(
    'name'
  );
  const sizes = $('select[name="MMERGE3"] option:not([value=""])')
    .map((index, el) => ({ id: el.attribs.value, name: el.attribs.value }))
    .toArray();
  return {
    styleInput: false,
    sizeInput: true,
    sizes,
    size: sizes[0].id,
    raffleDetails: {
      formLink,
      id
    }
  };
};

const processBSTNRaffleInfo = (body, cookies) => {
  console.log(cookies);
  const $ = cheerio.load(body);
  const sizes = $(
    '#registration-form > div > div > div > select:first-child option:not([value=""])'
  )
    .map((index, el) => ({ id: el.attribs.value, name: el.attribs.value }))
    .toArray();
  return {
    styleInput: false,
    sizeInput: true,
    sizes,
    size: sizes[0].id,
    raffleDetails: {}
  };
};

const loadBSTNRaffleInfo = async link =>
  new Promise((resolve, reject) => {
    try {
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
      win.webContents.on('close', () => {
        reject(new Error('Closed Window Before Finished'));
      });
      win.loadURL(link, {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36'
      });
      win.webContents.once('dom-ready', async () => {
        const result = await win.webContents.executeJavaScript(
          'document.documentElement.innerHTML',
          false
        );
        if (result.includes('Raffle registration ends in')) {
          const cookies = await win.webContents.executeJavaScript(
            'document.cookie',
            true
          );
          win.close();
          resolve(processBSTNRaffleInfo(result, cookies));
        } else {
          win.webContents.once('dom-ready', async () => {
            const result2 = await win.webContents.executeJavaScript(
              'document.documentElement.innerHTML',
              false
            );
            if (result2.includes('Raffle registration ends in')) {
              const cookies = await win.webContents.executeJavaScript(
                'document.cookie',
                true
              );
              win.close();
              resolve(processBSTNRaffleInfo(result2, cookies));
            } else {
              reject(new Error('Unable To Load Raffle Info'));
            }
          });
        }
      });
    } catch (error) {
      reject(error);
    }
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
      webSecurity: false
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
