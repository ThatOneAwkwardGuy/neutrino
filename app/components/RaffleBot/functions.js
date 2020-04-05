const { BrowserWindow } = require('electron').remote;
const cheerio = require('cheerio');
const rp = require('request-promise').defaults({
  headers: {
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Safari/537.36'
  }
});
const uuidv4 = require('uuid/v4');

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const loadRaffleInfo = async (site, raffleLink) => {
  if (raffleLink !== '') {
    switch (site) {
      case 'DSM':
        return loadDSMRaffleInfo(raffleLink);
      case 'DSMNY':
        return loadDSMNYRaffleInfo(raffleLink);
      case 'DSMLA':
        return loadDSMLARaffleInfo(raffleLink);
      case 'Footpatrol':
        return loadFootpatrolRaffleInfo(raffleLink);
      case 'Footpatrol UK':
        return loadFootpatrolUKRaffleInfo(raffleLink);
      case 'NakedCPH':
        return loadNakedCphRaffleInfo(raffleLink);
      case 'ExtraButter':
        return loadExtraButterRaffleInfo(raffleLink);
      case 'Rooted':
        return loadRootedRaffleInfo(raffleLink);
      case 'AFewStore':
        return loadAFewStoreRaffleInfo(raffleLink);
      case 'END':
        return loadEndRaffleInfo(raffleLink);
      case 'VooStore':
        return loadVooStoreRaffleInfo(raffleLink);
      case 'YME':
        return loadYMERaffleInfo(raffleLink);
      case 'TresBien':
        return loadTresBienInfo(raffleLink);
      case 'Bodega':
        return loadBodegaRaffleInfo(raffleLink);
      case 'OneBlockDown':
        return loadOneBlockDownRaffleInfo(raffleLink);
      // case 'Kickz':
      // return loadKickzRaffleInfo(raffleLink);
      case 'CityBlue':
        return loadCityBlueRaffleInfo(raffleLink);
      case 'Lapstone And Hammer':
        return loadLapstoneAndHammerRaffleInfo(raffleLink);
      case 'BSTN':
        return loadBSTNRaffleInfo(raffleLink);
      case 'Renarts':
        return loadRenartsRaffleInfo(raffleLink);
      case 'SupplyStore':
        return loadSupplyStoreRaffleInfo(raffleLink);
      case 'Stress95':
        return loadStress95RaffleInfo(raffleLink);
      case 'FootShop':
        return loadFootShopRaffleInfo(raffleLink);
      case 'Fear Of God':
        return loadFearOfGodRaffleInfo(raffleLink);
      case 'WoodWood':
        return loadWoodWoodRaffleInfo(raffleLink);
      case 'FootDistrict':
        return loadFootDistrctRaffleInfo(raffleLink);
      case 'EmpireShop':
        return loadEmpireShopRaffleInfo(raffleLink);
      case 'HollyWood':
        return loadHollyWoodRaffleInfo(raffleLink);
      case 'EighteenMontrose':
        return load18MontroseRaffleInfo(raffleLink);
      case 'CrusoeAndSons':
        return loadCrusoeAndSonsRaffleInfo(raffleLink);
      default:
        return undefined;
    }
  }
};

export const getCookiesFromWindow = async (link, proxy, userAgent) => {
  const tokenID = uuidv4();
  const win = await createNewWindow(tokenID, proxy);
  return new Promise((resolve, reject) => {
    try {
      win.loadURL(link);
      if (userAgent) {
        win.webContents.session.setUserAgent(userAgent);
      }
      win.webContents.on('dom-ready', async () => {
        const html = await win.webContents.executeJavaScript(
          'document.body.innerHTML',
          false
        );
        if (
          !html.includes('BOT or NOT?!') &&
          !html.includes('Pardon Our Interruption')
        ) {
          const cookies = await win.webContents.session.cookies.get({});
          win.close();
          resolve(cookies);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const loadDSMRaffleInfo = async link => {
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
  return new Promise((resolve, reject) => {
    try {
      win.loadURL(link);
      win.webContents.once('did-finish-load', async () => {
        const result = await win.webContents.executeJavaScript(
          'window.location.href',
          false
        );
        if (result === link) {
          const windowResult = await win.webContents.executeJavaScript(
            'document.documentElement.innerHTML',
            false
          );
          win.close();
          const $ = cheerio.load(windowResult);
          const styles = $('div[fs-field-validation-name*="Colour"] option')
            .map((index, style) => ({
              id: style.attribs.value,
              name: style.attribs.value
            }))
            .toArray();
          const sizes = $('div[fs-field-validation-name*="Size"] option')
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
          const colorFormID = $(
            'div[fs-field-validation-name*="Colour"] select'
          ).attr('name');
          const sizeFormID = $(
            'div[fs-field-validation-name*="Size"] select'
          ).attr('name');
          const formFields = {};
          $('form input').each((index, element) => {
            const { name, value } = element.attribs;
            formFields[name] = value;
          });
          resolve({
            styles,
            sizes,
            raffleDetails: {
              fullNameFormID,
              emailFormID,
              phoneFormID,
              postcodeFormID,
              colorFormID,
              sizeFormID,
              ...formFields
            }
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const loadDSMNYRaffleInfo = async link => {
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
  return new Promise((resolve, reject) => {
    try {
      win.loadURL(link);
      win.webContents.once('did-finish-load', async () => {
        const result = await win.webContents.executeJavaScript(
          'window.location.href',
          false
        );
        if (result === link) {
          const windowResult = await win.webContents.executeJavaScript(
            'document.documentElement.innerHTML',
            false
          );
          win.close();
          const $ = cheerio.load(windowResult);
          const styles = $('div[fs-field-validation-name*="Color"] option')
            .map((index, style) => ({
              id: style.attribs.value,
              name: style.attribs.value
            }))
            .toArray();
          const sizes = $('div[fs-field-validation-name*="Size"] option')
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
          const colorFormID = $(
            'div[fs-field-validation-name*="Color"] select'
          ).attr('name');
          const sizeFormID = $(
            'div[fs-field-validation-name*="Size"] select'
          ).attr('name');
          const formFields = {};
          $('form input').each((index, element) => {
            const { name, value } = element.attribs;
            formFields[name] = value;
          });
          resolve({
            sizeInput: sizeFormID !== undefined,
            styleInput: colorFormID !== undefined,
            styles,
            sizes,
            raffleDetails: {
              fullNameFormID,
              emailFormID,
              phoneFormID,
              postcodeFormID,
              colorFormID,
              sizeFormID,
              ...formFields
            }
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const loadDSMLARaffleInfo = async link => {
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
  return new Promise((resolve, reject) => {
    try {
      win.loadURL(link);
      win.webContents.once('did-finish-load', async () => {
        const result = await win.webContents.executeJavaScript(
          'window.location.href',
          false
        );
        if (result === link) {
          const windowResult = await win.webContents.executeJavaScript(
            'document.documentElement.innerHTML',
            false
          );
          win.close();
          const $ = cheerio.load(windowResult);
          const styles = $('div[fs-field-validation-name*="Color"] option')
            .map((index, style) => ({
              id: style.attribs.value,
              name: style.attribs.value
            }))
            .toArray();
          const sizes = $('div[fs-field-validation-name*="Size"] option')
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
          const colorFormID = $(
            'div[fs-field-validation-name*="Color"] select'
          ).attr('name');
          const sizeFormID = $(
            'div[fs-field-validation-name*="Size"] select'
          ).attr('name');
          const formFields = {};
          $('form input').each((index, element) => {
            const { name, value } = element.attribs;
            formFields[name] = value;
          });
          resolve({
            sizeInput: sizeFormID !== undefined,
            styleInput: colorFormID !== undefined,
            styles,
            sizes,
            raffleDetails: {
              fullNameFormID,
              emailFormID,
              phoneFormID,
              postcodeFormID,
              colorFormID,
              sizeFormID,
              ...formFields
            }
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};
const loadStress95RaffleInfo = async link => {
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
          const renderData = await win.webContents.executeJavaScript(
            'window.rendererData',
            true
          );
          let typeformCode;
          if (currentURL.includes('typeform.com')) {
            typeformCode = renderData.form.id;
          } else {
            const $ = cheerio.load(innerHTML);
            // eslint-disable-next-line prefer-destructuring
            typeformCode = $('.typeform-widget')
              .attr('data-url')
              .split('/to/')[1];
          }
          resolve({
            sizeInput: false,
            styleInput: false,
            raffleDetails: { typeformCode, renderData }
          });
          win.close();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const loadFootDistrctRaffleInfo = async link => {
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
          const renderData = await win.webContents.executeJavaScript(
            'window.rendererData',
            true
          );
          let typeformCode;
          if (currentURL.includes('typeform.com')) {
            typeformCode = renderData.form.id;
          } else {
            const $ = cheerio.load(innerHTML);
            // eslint-disable-next-line prefer-destructuring
            typeformCode = $('.typeform-widget')
              .attr('data-url')
              .split('/to/')[1];
          }
          let sizes = [];
          const sizesField = renderData.form.fields.find(
            field => field.title === 'Select your Size'
          );
          if (sizesField) {
            sizes = sizesField.properties.choices.map(choice => ({
              id: choice.label,
              name: choice.label
            }));
          }
          resolve({
            sizes,
            size: sizes[0].id,
            sizeInput: true,
            styleInput: false,
            raffleDetails: { typeformCode, renderData }
          });
          win.close();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const loadNakedCphRaffleInfo = async link => {
  const cookies = await getCookiesFromWindow(link);
  return {
    raffleDetails: { cookies },
    sizeInput: false,
    styleInput: false
  };
};

const loadYMERaffleInfo = async link => {
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
          if (currentURL.includes('ymeuniverse.typeform.com')) {
            typeformCode = renderData.form.id;
          } else {
            const $ = cheerio.load(innerHTML);
            // eslint-disable-next-line prefer-destructuring
            typeformCode = $('.typeform-widget')
              .attr('data-url')
              .split('/to/')[1];
          }
          if (!currentURL.includes('ymeuniverse.typeform.com')) {
            win.loadURL(
              `https://ymeuniverse.typeform.com/to/${typeformCode}?typeform-embed=embed-widget`
            );
            win.webContents.on('dom-ready', async () => {
              renderData = await win.webContents.executeJavaScript(
                'window.rendererData',
                true
              );
              let sizes = [];
              const sizesField = renderData.form.fields.find(
                field => field.title === 'What is your size?'
              );
              if (sizesField) {
                sizes = sizesField.properties.choices.map(choice => ({
                  id: choice.label,
                  name: choice.label
                }));
              }
              resolve({
                sizeInput: true,
                styleInput: false,
                sizes,
                size: sizes[0].id,
                raffleDetails: { typeformCode, renderData }
              });
              win.close();
            });
          } else {
            let sizes = [];
            const sizesField = renderData.form.fields.find(
              field => field.title === 'What is your size?'
            );
            if (sizesField) {
              sizes = sizesField.properties.choices.map(choice => ({
                id: choice.label,
                name: choice.label
              }));
            }
            resolve({
              sizeInput: true,
              styleInput: false,
              sizes,
              size: sizes[0].id,
              raffleDetails: { typeformCode, renderData }
            });
            win.close();
          }
        }
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

const loadFootpatrolRaffleInfo = async link => {
  const response = await rp.get(link);
  const $ = cheerio.load(response);
  const sizes = $('#shoesize option:not([value=""])')
    .map((index, size) => ({
      id: size.attribs.value,
      name: $(size).text()
    }))
    .toArray();
  const rafflesId = $('#raffles_id').attr('value');
  // const token = $('input[name="token"]').val();
  // const pageID = $('input[name="page_id"]').val();
  return {
    styleInput: false,
    sizeInput: true,
    sizes,
    size: sizes[0].id,
    raffleDetails: { rafflesId }
  };
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
        const innerHTML = await win.webContents.executeJavaScript(
          'document.documentElement.innerHTML',
          false
        );
        const $ = cheerio.load(innerHTML);
        const styles = $('select[placeholder="Colour"] option:not([disabled])')
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

const loadCrusoeAndSonsRaffleInfo = async link => {
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

const loadRootedRaffleInfo = async link => {
  const response = await rp.get(`${link.split('?')[0]}.json`);
  const raffleInfo = JSON.parse(response);
  const sizes = raffleInfo.product.variants.map(size => ({
    id: size.id,
    name: size.title
  }));
  return {
    styleInput: false,
    sizeInput: true,
    size: sizes[0].id.toString(),
    sizes,
    raffleDetails: { product: raffleInfo }
  };
};

const loadRenartsRaffleInfo = async link => {
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

const loadSupplyStoreRaffleInfo = async link => {
  const response = await rp.get(link);
  const $ = cheerio.load(response);
  const raffleId = $('#raffleForm').data('id');
  let sizes = [];
  const selectFields = $('label').filter(
    (index, element) => $(element).text() === 'Size'
  );
  const selectField = $(selectFields)
    .siblings('select')
    .children('option');
  sizes = selectField
    .map((index, size) => ({
      id: size.attribs.value,
      name: $(size).text()
    }))
    .toArray();
  const formFields = {};
  $('ul label').each((index, element) => {
    const labelElement = $(element);
    const labelFor = labelElement.attr('for');
    const input = $(`#${labelFor}`).attr('name');
    formFields[labelElement.text()] = input;
  });
  return {
    styleInput: false,
    size: sizes.length > 1 ? sizes[0].id.toString() : '',
    sizes,
    raffleDetails: { ...formFields, raffleId }
  };
};

const loadEndRaffleInfo = async link => {
  const splitLink = link.split('/');
  const apilink = `https://launches-api.endclothing.com/api/products/${
    splitLink[splitLink.length - 1]
  }`;
  console.log(apilink);
  const apiResponse = await rp({
    method: 'GET',
    headers: {
      Connection: 'keep-alive',
      'Cache-Control': 'max-age=0',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
      'Sec-Fetch-Dest': 'document',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Accept-Language': 'en-US,en;q=0.9'
    },
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

const loadTresBienInfo = async link => {
  const page = await rp.get(link);
  const $ = cheerio.load(page);
  const sku = $('#raffle-form input[name="sku"]').attr('value');
  const sizes = $('#Size_raffle option:not([value=""])')
    .map((index, size) => ({
      id: size.attribs.value,
      name: $(size).text()
    }))
    .toArray();
  return {
    styleInput: false,
    sizeInput: true,
    sizes,
    size: sizes[0].id,
    raffleDetails: { sku }
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

const loadEmpireShopRaffleInfo = async link => {
  const response = await rp.get(link);
  const $ = cheerio.load(response);
  console.log($('select[name="Taille__Size"] option'));
  const sizes = $('select[name="Taille__Size"] option')
    .map((index, size) => ({
      id: size.attribs.value,
      name: $(size).text()
    }))
    .toArray();
  const image = $("input[name='image']").val();
  const numFormulaire = $('input[name="num_formulaire"]').val();
  const dysListeChamps = $('input[name="dys_liste_champs"]').val();
  const dysListeChampsId = $('input[name="dys_liste_champs_id"]').val();
  return {
    styleInput: false,
    sizeInput: true,
    sizes,
    size: sizes[0].id,
    raffleDetails: {
      image,
      numFormulaire,
      dysListeChamps,
      dysListeChampsId
    }
  };
};

const loadHollyWoodRaffleInfo = async link => {
  const win = await createNewWindow('', '');
  win.loadURL(link);
  return new Promise((resolve, reject) => {
    try {
      win.webContents.on('close', () => {
        reject(new Error('Closed Window Before Finished'));
      });
      win.webContents.on('dom-ready', async () => {
        const renderData = await win.webContents.executeJavaScript(
          'window.rendererData',
          true
        );
        const typeformCode = renderData.form.id;
        let sizes = [];
        const sizesField = renderData.form.fields.find(
          field => field.title === 'YOUR US SIZE'
        );
        if (sizesField) {
          sizes = sizesField.properties.choices.map(choice => ({
            id: choice.label,
            name: choice.label
          }));
        }
        resolve({
          sizes,
          size: sizes[0].id,
          sizeInput: true,
          styleInput: false,
          raffleDetails: { typeformCode, renderData }
        });
        win.close();
      });
    } catch (error) {
      reject(error);
    }
  });
};

const load18MontroseRaffleInfo = async link => {
  const win = await createNewWindow('', '');
  win.loadURL(link);
  return new Promise((resolve, reject) => {
    try {
      win.webContents.on('close', () => {
        reject(new Error('Closed Window Before Finished'));
      });
      win.webContents.on('dom-ready', async () => {
        const result = await win.webContents.executeJavaScript(
          'window.location.href',
          false
        );
        if (result === link) {
          const mainPage = await win.webContents.executeJavaScript(
            'document.documentElement.innerHTML',
            false
          );
          let $ = cheerio.load(mainPage);
          const rafflePageSrc = $('script[data-sharing="lp-embed"]').attr(
            'data-page-id'
          );
          const response = await rp.get(
            `https://email.18montrose.com/p/${rafflePageSrc}`
          );
          $ = cheerio.load(response);
          const sizes = $('option:not([value=""])')
            .filter((index, el) => {
              const text = $(el).text();
              return text.includes('UK');
            })
            .map((index, el) => ({
              id: el.attribs.value,
              name: $(el).text()
            }))
            .toArray();
          const raffleDetails = {
            url: $('form[name="lpsurveyform"]').attr('action'),
            respondent: $('input[name="respondent"]').attr('value')
          };
          $('div[data-element-settings~="answer"]').each((index, el) => {
            const input = $(el);
            const inputDetails = JSON.parse(
              input.attr('data-element-settings')
            );
            if (inputDetails.dataField !== undefined) {
              if (inputDetails.dataField === 'EMAIL') {
                raffleDetails.emailFormID = inputDetails.id;
              }
              if (inputDetails.dataField === 'FIRSTNAME') {
                raffleDetails.firstNameFormID = inputDetails.id;
              }
              if (inputDetails.dataField === 'LASTNAME') {
                raffleDetails.lastNameFormID = inputDetails.id;
              }
              if (inputDetails.dataField === 'COUNTRY') {
                raffleDetails.countryFormID = inputDetails.id;
              }
              if (inputDetails.dataField === 'IG_NAME') {
                raffleDetails.instagramFormID = inputDetails.id;
              }
              if (inputDetails.dataField.includes('SIZE')) {
                raffleDetails.sizeFormID = inputDetails.id;
              }
            }
            if (
              inputDetails.list !== undefined &&
              inputDetails.list.length === 1 &&
              inputDetails.list[0].text.includes('Terms and Conditions')
            ) {
              raffleDetails.checkboxFormID = inputDetails.id;
            }
          });
          resolve({
            styleInput: false,
            raffleDetails,
            sizeInput: true,
            sizes,
            size: sizes[0].id
          });
          win.close();
        }
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

const loadAFewStoreRaffleInfo = async link => {
  const body = await rp.get(link);
  const $ = cheerio.load(body);
  const endpoint = $(
    'div[data-dojo-type="mojo/pages-signup-forms/Loader"]'
  ).attr('endpoint');
  const queryParams = new URLSearchParams(
    endpoint.slice(endpoint.indexOf('?'))
  );
  const settings = await rp
    .get(
      `https://mc.us5.list-manage.com/signup-form/settings?u=${queryParams.get(
        'u'
      )}&id=${queryParams.get('id')}&for_preview=0`
    )
    .json();
  const unformattedSizes = settings.config.fields.find(
    field => field.name === 'SIZES'
  );
  console.log(unformattedSizes);
  const sizes = unformattedSizes.choices.map(size => ({
    name: size.value,
    id: size.value
  }));
  return {
    styleInput: false,
    raffleDetails: { ...settings },
    sizeInput: true,
    sizes,
    size: sizes[0].id
  };
  // const win = await createNewWindow('', '');
  // win.loadURL(link);
  // return new Promise((resolve, reject) => {
  //   try {
  //     win.webContents.on('close', () => {
  //       reject(new Error('Closed Window Before Finished'));
  //     });
  //     win.webContents.on('dom-ready', async () => {
  //       const result = await win.webContents.executeJavaScript(
  //         'window.location.href',
  //         false
  //       );
  //       if (result === link) {
  //         const mainPage = await win.webContents.executeJavaScript(
  //           'document.documentElement.innerHTML',
  //           false
  //         );
  //         const $ = cheerio.load(mainPage);
  //         const id = $('input[tabIndex="-1"]').attr('value');
  //         const url = $('form').attr('action');
  //         const sizes = $('select[name="SIZES"] option')
  //           .map((index, el) => ({
  //             id: el.attribs.value,
  //             name: $(el).text()
  //           }))
  //           .toArray();
  //         console.log(id);
  //         console.log(url);
  //         console.log(sizes);
  //         resolve({
  //           styleInput: false,
  //           raffleDetails: { id, url },
  //           sizeInput: true,
  //           sizes,
  //           size: sizes[0].id
  //         });
  //         win.close();
  //       }
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     reject(error);
  //   }
  // });
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
      win.webContents.once('did-finish-load', async () => {
        const mwMotivatorObjects = await win.webContents.executeJavaScript(
          'mwMotivatorObjects',
          false
        );
        if (mwMotivatorObjects) {
          const sizes = mwMotivatorObjects.product.variants.map(size => ({
            id: size.option1,
            name: size.option1
          }));
          const raffleLink = mwMotivatorObjects.product.content.split(
            /src\s*=\s*"(.+?)"/gm
          )[1];
          win.webContents.loadURL(raffleLink);
          win.webContents.once('did-finish-load', async () => {
            const googleFormDetails = await win.webContents.executeJavaScript(
              'FB_PUBLIC_LOAD_DATA_',
              false
            );
            if (googleFormDetails) {
              resolve({
                styleInput: false,
                sizeInput: true,
                sizes,
                size: sizes[0].id,
                raffleDetails: {
                  mwMotivatorObjects,
                  googleFormDetails,
                  raffleLink
                }
              });
            }
            reject(new Error('Unable to find OneBlockDown Raffle Details'));
            win.close();
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });

const loadFearOfGodRaffleInfo = async link =>
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
        const iframeSrc = await win.webContents.executeJavaScript(
          'document.querySelector("#vs_full_frame").src',
          false
        );
        if (iframeSrc.includes('http')) {
          win.loadURL(iframeSrc);
          win.webContents.once('dom-ready', async () => {
            const id = await win.webContents.executeJavaScript(
              `document.querySelector('#entry-form input[name="id"]').value`,
              false
            );
            const entrySource = await win.webContents.executeJavaScript(
              `document.querySelector('#entry_source').value`,
              false
            );
            const sizeDropDown = await win.webContents.executeJavaScript(
              `document.querySelector('select[data-error="Select your size!"]').name`,
              false
            );
            const sizes = await win.webContents.executeJavaScript(
              `[...document.querySelectorAll('select[data-error="Select your size!"] option:not([value=""])')].map((el) => ({id:el.value,name:el.value}))`,
              false
            );
            win.close();
            resolve({
              styleInput: false,
              sizeInput: true,
              sizes,
              size: sizes[0].id,
              raffleDetails: {
                iframeSrc,
                id,
                entrySource,
                sizeDropDown
              }
            });
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });

const loadFootShopRaffleInfo = async link =>
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
      win.webContents.once('did-finish-load', async () => {
        const raffleInfo = await win.webContents.executeJavaScript(
          '__INITIAL_STATE__',
          false
        );
        // const id = raffleInfo.raffleDetail.raffle.id;
        const {
          raffleDetail: { raffle: id }
        } = raffleInfo;
        win.close();
        if (raffleInfo && id) {
          const sizes = raffleInfo.raffleDetail.raffle.sizeSets.Unisex.sizes.map(
            size => ({ name: size.us, id: size.id })
          );
          resolve({
            styleInput: false,
            sizeInput: true,
            sizes,
            size: sizes[0].id,
            raffleDetails: {
              raffleInfo,
              id
            }
          });
        }
        reject(new Error('Unable to find FootShop Raffle Details'));
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
  const styles = $('select[name="MMERGE3"] option:not([value=""])')
    .map((index, el) => ({ id: el.attribs.value, name: el.attribs.value }))
    .toArray();

  const sizes = [
    { id: '4', name: '4' },
    { id: '4.5', name: '4.5' },
    { id: '5', name: '5' },
    { id: '5.5', name: '5.5' },
    { id: '6', name: '6' },
    { id: '6.5', name: '6.5' },
    { id: '7', name: '7' },
    { id: '7.5', name: '7.5' },
    { id: '8', name: '8' },
    { id: '8.5', name: '8.5' },
    { id: '9', name: '9' },
    { id: '9.5', name: '9.5' },
    { id: '10', name: '10' },
    { id: '10.5', name: '10.5' },
    { id: '11', name: '11' },
    { id: '11.5', name: '11.5' },
    { id: '12', name: '12' },
    { id: '12.5', name: '12.5' },
    { id: '13', name: '13' },
    { id: '13.5', name: '13.5' },
    { id: '14', name: '14' }
  ];

  return {
    styleInput: false,
    sizeInput: true,
    styles,
    sizes,
    size: sizes[0].id,
    raffleDetails: {
      formLink,
      id
    }
  };
};

const processBSTNRaffleInfo = (body, cookies, windowCookies) => {
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
    raffleDetails: { cookies, windowCookies }
  };
};

export const loadWoodWoodRaffleInfo = async link => {
  const body = await rp.get(link);
  const $ = cheerio.load(body);
  const sizes = $('#MERGE7 option')
    .map((index, size) => ({
      id: size.attribs.value,
      name: size.attribs.value
    }))
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
          const windowCookies = await win.webContents.session.cookies.get({
            domain: 'bstn.com'
          });
          console.log(windowCookies);
          win.close();
          resolve(processBSTNRaffleInfo(result, cookies, windowCookies));
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
              const windowCookies2 = await win.webContents.session.cookies.get({
                domain: 'bstn.com'
              });
              console.log(windowCookies2);
              win.close();
              resolve(processBSTNRaffleInfo(result2, cookies, windowCookies2));
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
      win.webContents.on('login', (event, request, authInfo, callback) => {
        event.preventDefault();
        callback(proxyArray[0], proxyArray[1]);
      });
    }
    const proxyIpAndPort = proxyArray.slice(-2);
    win.webContents.session.setProxy(
      { proxyRules: `${proxyIpAndPort[0]}:${proxyIpAndPort[1]},direct://` },
      () => {
        resolve();
      }
    );
  });

export const getRandomIntInRange = (min, max) => {
  const roundedMin = Math.ceil(min);
  const roundedMax = Math.floor(max);
  return Math.floor(Math.random() * (roundedMax - roundedMin)) + min;
};
