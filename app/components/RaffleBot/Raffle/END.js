import { ValidateSchema, ENDSchema } from '../schemas';
import { ENDCountries } from '../../../constants/constants';

const rp = require('request-promise');
const braintree = require('braintree-web');

export default class END {
  constructor(
    url,
    profile,
    site,
    style,
    size,
    status,
    proxy,
    raffleDetails,
    forceUpdate,
    incrementRaffles
  ) {
    this.url = url;
    this.profile = profile;
    this.run = false;
    this.site = site;
    this.style = style;
    this.size = size;
    this.status = status;
    this.forceUpdate = forceUpdate;
    this.raffleDetails = raffleDetails;
    this.incrementRaffles = incrementRaffles;
    this.cookieJar = rp.jar();
    this.rp = rp.defaults({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
      },
      proxy,
      jar: this.cookieJar
    });
  }

  changeStatus = status => {
    this.status = status;
    this.forceUpdate();
  };

  start = async () => {
    while (this.run) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.makeEntry();
      } catch (error) {
        console.error(error);
        this.changeStatus(`Error Submitting Raffle - ${error.message}`);
      }
      this.run = false;
    }
  };

  checkEmailExists = async email => {
    const response = await this.rp({
      method: 'POST',
      uri: 'https://launches-api.endclothing.com/api/account/exists',
      json: true,
      body: { email }
    });
    return response.exists;
  };

  login = async () => {
    await this.rp({
      method: 'GET',
      uri: this.url
    });

    const dataString =
      'p=%7B%22proof%22%3A%2218%3A1575172464026%3ABGil7xqP5QotgDbB0aPO%22%2C%22cookies%22%3A1%2C%22setTimeout%22%3A0%2C%22setInterval%22%3A0%2C%22appName%22%3A%22Netscape%22%2C%22platform%22%3A%22MacIntel%22%2C%22syslang%22%3A%22en-US%22%2C%22userlang%22%3A%22en-US%22%2C%22cpu%22%3A%22%22%2C%22productSub%22%3A%2220030107%22%2C%22plugins%22%3A%7B%220%22%3A%22ChromePDFPlugin%22%2C%221%22%3A%22ChromePDFViewer%22%2C%222%22%3A%22NativeClient%22%7D%2C%22mimeTypes%22%3A%7B%220%22%3A%22application%2Fpdf%22%2C%221%22%3A%22PortableDocumentFormatapplication%2Fx-google-chrome-pdf%22%2C%222%22%3A%22NativeClientExecutableapplication%2Fx-nacl%22%2C%223%22%3A%22PortableNativeClientExecutableapplication%2Fx-pnacl%22%7D%2C%22screen%22%3A%7B%22width%22%3A1920%2C%22height%22%3A1200%2C%22colorDepth%22%3A24%7D%2C%22fonts%22%3A%7B%220%22%3A%22HoeflerText%22%2C%221%22%3A%22Monaco%22%2C%222%22%3A%22Georgia%22%2C%223%22%3A%22TrebuchetMS%22%2C%224%22%3A%22Verdana%22%2C%225%22%3A%22AndaleMono%22%2C%226%22%3A%22Monaco%22%2C%227%22%3A%22CourierNew%22%2C%228%22%3A%22Courier%22%7D%2C%22fp2%22%3A%7B%22userAgent%22%3A%22Mozilla%2F5.0(Macintosh%3BIntelMacOSX10_15_0)AppleWebKit%2F537.36(KHTML%2ClikeGecko)Chrome%2F78.0.3904.108Safari%2F537.36%22%2C%22language%22%3A%22en-US%22%2C%22screen%22%3A%7B%22width%22%3A1920%2C%22height%22%3A1200%2C%22availHeight%22%3A1177%2C%22availWidth%22%3A1920%2C%22pixelDepth%22%3A24%2C%22innerWidth%22%3A1059%2C%22innerHeight%22%3A1088%2C%22outerWidth%22%3A1920%2C%22outerHeight%22%3A1200%2C%22devicePixelRatio%22%3A2%7D%2C%22timezone%22%3A0%2C%22indexedDb%22%3Atrue%2C%22addBehavior%22%3Afalse%2C%22openDatabase%22%3Atrue%2C%22cpuClass%22%3A%22unknown%22%2C%22platform%22%3A%22MacIntel%22%2C%22doNotTrack%22%3A%22unknown%22%2C%22plugins%22%3A%22ChromePDFPlugin%3A%3APortableDocumentFormat%3A%3Aapplication%2Fx-google-chrome-pdf~pdf%3BChromePDFViewer%3A%3A%3A%3Aapplication%2Fpdf~pdf%3BNativeClient%3A%3A%3A%3Aapplication%2Fx-nacl~%2Capplication%2Fx-pnacl~%22%2C%22canvas%22%3A%7B%22winding%22%3A%22yes%22%2C%22towebp%22%3Atrue%2C%22blending%22%3Atrue%2C%22img%22%3A%221dbd283d7c1cfb3aefeda198a28886f3147a19e2%22%7D%2C%22webGL%22%3A%7B%22img%22%3A%22283e1be0e5ec3230a8dc0bb69e17722f16204065%22%2C%22extensions%22%3A%22ANGLE_instanced_arrays%3BEXT_blend_minmax%3BEXT_color_buffer_half_float%3BEXT_disjoint_timer_query%3BEXT_float_blend%3BEXT_frag_depth%3BEXT_shader_texture_lod%3BEXT_texture_filter_anisotropic%3BWEBKIT_EXT_texture_filter_anisotropic%3BEXT_sRGB%3BOES_element_index_uint%3BOES_standard_derivatives%3BOES_texture_float%3BOES_texture_float_linear%3BOES_texture_half_float%3BOES_texture_half_float_linear%3BOES_vertex_array_object%3BWEBGL_color_buffer_float%3BWEBGL_compressed_texture_s3tc%3BWEBKIT_WEBGL_compressed_texture_s3tc%3BWEBGL_compressed_texture_s3tc_srgb%3BWEBGL_debug_renderer_info%3BWEBGL_debug_shaders%3BWEBGL_depth_texture%3BWEBKIT_WEBGL_depth_texture%3BWEBGL_draw_buffers%3BWEBGL_lose_context%3BWEBKIT_WEBGL_lose_context%22%2C%22aliasedlinewidthrange%22%3A%22%5B1%2C1%5D%22%2C%22aliasedpointsizerange%22%3A%22%5B1%2C2047%5D%22%2C%22alphabits%22%3A8%2C%22antialiasing%22%3A%22yes%22%2C%22bluebits%22%3A8%2C%22depthbits%22%3A24%2C%22greenbits%22%3A8%2C%22maxanisotropy%22%3A16%2C%22maxcombinedtextureimageunits%22%3A80%2C%22maxcubemaptexturesize%22%3A16384%2C%22maxfragmentuniformvectors%22%3A1024%2C%22maxrenderbuffersize%22%3A16384%2C%22maxtextureimageunits%22%3A16%2C%22maxtexturesize%22%3A16384%2C%22maxvaryingvectors%22%3A31%2C%22maxvertexattribs%22%3A16%2C%22maxvertextextureimageunits%22%3A16%2C%22maxvertexuniformvectors%22%3A1024%2C%22maxviewportdims%22%3A%22%5B16384%2C16384%5D%22%2C%22redbits%22%3A8%2C%22renderer%22%3A%22WebKitWebGL%22%2C%22shadinglanguageversion%22%3A%22WebGLGLSLES1.0(OpenGLESGLSLES1.0Chromium)%22%2C%22stencilbits%22%3A0%2C%22vendor%22%3A%22WebKit%22%2C%22version%22%3A%22WebGL1.0(OpenGLES2.0Chromium)%22%2C%22vertexshaderhighfloatprecision%22%3A23%2C%22vertexshaderhighfloatprecisionrangeMin%22%3A127%2C%22vertexshaderhighfloatprecisionrangeMax%22%3A127%2C%22vertexshadermediumfloatprecision%22%3A23%2C%22vertexshadermediumfloatprecisionrangeMin%22%3A127%2C%22vertexshadermediumfloatprecisionrangeMax%22%3A127%2C%22vertexshaderlowfloatprecision%22%3A23%2C%22vertexshaderlowfloatprecisionrangeMin%22%3A127%2C%22vertexshaderlowfloatprecisionrangeMax%22%3A127%2C%22fragmentshaderhighfloatprecision%22%3A23%2C%22fragmentshaderhighfloatprecisionrangeMin%22%3A127%2C%22fragmentshaderhighfloatprecisionrangeMax%22%3A127%2C%22fragmentshadermediumfloatprecision%22%3A23%2C%22fragmentshadermediumfloatprecisionrangeMin%22%3A127%2C%22fragmentshadermediumfloatprecisionrangeMax%22%3A127%2C%22fragmentshaderlowfloatprecision%22%3A23%2C%22fragmentshaderlowfloatprecisionrangeMin%22%3A127%2C%22fragmentshaderlowfloatprecisionrangeMax%22%3A127%2C%22vertexshaderhighintprecision%22%3A0%2C%22vertexshaderhighintprecisionrangeMin%22%3A31%2C%22vertexshaderhighintprecisionrangeMax%22%3A30%2C%22vertexshadermediumintprecision%22%3A0%2C%22vertexshadermediumintprecisionrangeMin%22%3A31%2C%22vertexshadermediumintprecisionrangeMax%22%3A30%2C%22vertexshaderlowintprecision%22%3A0%2C%22vertexshaderlowintprecisionrangeMin%22%3A31%2C%22vertexshaderlowintprecisionrangeMax%22%3A30%2C%22fragmentshaderhighintprecision%22%3A0%2C%22fragmentshaderhighintprecisionrangeMin%22%3A31%2C%22fragmentshaderhighintprecisionrangeMax%22%3A30%2C%22fragmentshadermediumintprecision%22%3A0%2C%22fragmentshadermediumintprecisionrangeMin%22%3A31%2C%22fragmentshadermediumintprecisionrangeMax%22%3A30%2C%22fragmentshaderlowintprecision%22%3A0%2C%22fragmentshaderlowintprecisionrangeMin%22%3A31%2C%22fragmentshaderlowintprecisionrangeMax%22%3A30%2C%22unmaskedvendor%22%3A%22NVIDIACorporation%22%2C%22unmaskedrenderer%22%3A%22NVIDIAGeForceGT750MOpenGLEngine%22%7D%2C%22touch%22%3A%7B%22maxTouchPoints%22%3A0%2C%22touchEvent%22%3Afalse%2C%22touchStart%22%3Afalse%7D%2C%22video%22%3A%7B%22ogg%22%3A%22probably%22%2C%22h264%22%3A%22probably%22%2C%22webm%22%3A%22probably%22%7D%2C%22audio%22%3A%7B%22ogg%22%3A%22probably%22%2C%22mp3%22%3A%22probably%22%2C%22wav%22%3A%22probably%22%2C%22m4a%22%3A%22maybe%22%7D%2C%22vendor%22%3A%22GoogleInc.%22%2C%22product%22%3A%22Gecko%22%2C%22productSub%22%3A%2220030107%22%2C%22browser%22%3A%7B%22ie%22%3Afalse%2C%22chrome%22%3Atrue%2C%22webdriver%22%3Afalse%7D%2C%22window%22%3A%7B%22historyLength%22%3A2%2C%22hardwareConcurrency%22%3A8%2C%22iframe%22%3Afalse%2C%22battery%22%3Atrue%7D%2C%22location%22%3A%7B%22protocol%22%3A%22https%3A%22%7D%2C%22fonts%22%3A%22ArialUnicodeMS%3BGillSans%3BHelveticaNeue%22%2C%22devices%22%3A%7B%22count%22%3A9%2C%22data%22%3A%7B%220%22%3A%7B%22deviceId%22%3A%22default%22%2C%22groupId%22%3A%22304709a77635ac620d441df6ad6da93329cad3c09ab52fd5fbd3d34e22e5fbf9%22%2C%22kind%22%3A%22audioinput%22%2C%22label%22%3A%22%22%7D%2C%221%22%3A%7B%22deviceId%22%3A%2276ccfe6032df7283041feb265e3bd3fd5fae9ad35deba21e45933609f53491d0%22%2C%22groupId%22%3A%22fcc1aadce010135f7daa52b45f8a4847ce47794fb7e7a3424534d5cbc98ba28c%22%2C%22kind%22%3A%22audioinput%22%2C%22label%22%3A%22%22%7D%2C%222%22%3A%7B%22deviceId%22%3A%22ce021e61d8d175b9f2b932f2ba99f8dac4244312bb1a5901fc3e185b935801b7%22%2C%22groupId%22%3A%2233e0a63e6ef86d953767b563b792636befd2a1b7343d5cd0f5e29b4bced35a50%22%2C%22kind%22%3A%22audioinput%22%2C%22label%22%3A%22%22%7D%2C%223%22%3A%7B%22deviceId%22%3A%22bc26d250ba2eab00ea38502f87e1bc06800327bfb569b7651d8192127594dcac%22%2C%22groupId%22%3A%22304709a77635ac620d441df6ad6da93329cad3c09ab52fd5fbd3d34e22e5fbf9%22%2C%22kind%22%3A%22audioinput%22%2C%22label%22%3A%22%22%7D%2C%224%22%3A%7B%22deviceId%22%3A%22c2ff6aee772b82d16fa710744725dc0996f95fb0fb49ba4cb3b4a81a170816ce%22%2C%22groupId%22%3A%22784674dbc8b81cfb49335914f34dfcb532fd9ce34a5945ab5a0ef99bcc8ef9e1%22%2C%22kind%22%3A%22videoinput%22%2C%22label%22%3A%22%22%7D%2C%225%22%3A%7B%22deviceId%22%3A%22default%22%2C%22groupId%22%3A%22304709a77635ac620d441df6ad6da93329cad3c09ab52fd5fbd3d34e22e5fbf9%22%2C%22kind%22%3A%22audiooutput%22%2C%22label%22%3A%22%22%7D%2C%226%22%3A%7B%22deviceId%22%3A%2206785d650eed48bb073d3107c39ef4be0a478f63390cd144140a7e7a78b91831%22%2C%22groupId%22%3A%22fcc1aadce010135f7daa52b45f8a4847ce47794fb7e7a3424534d5cbc98ba28c%22%2C%22kind%22%3A%22audiooutput%22%2C%22label%22%3A%22%22%7D%2C%227%22%3A%7B%22deviceId%22%3A%22ce021e61d8d175b9f2b932f2ba99f8dac4244312bb1a5901fc3e185b935801b7%22%2C%22groupId%22%3A%2233e0a63e6ef86d953767b563b792636befd2a1b7343d5cd0f5e29b4bced35a50%22%2C%22kind%22%3A%22audiooutput%22%2C%22label%22%3A%22%22%7D%2C%228%22%3A%7B%22deviceId%22%3A%22668c9b39574ac8ce82ee7852066f804e1c2a239ef9cb9571cedae1340da5cc20%22%2C%22groupId%22%3A%22304709a77635ac620d441df6ad6da93329cad3c09ab52fd5fbd3d34e22e5fbf9%22%2C%22kind%22%3A%22audiooutput%22%2C%22label%22%3A%22%22%7D%7D%7D%7D%7D';

    await this.rp({
      url:
        'https://launches.endclothing.com/lendwtuwrbtcwyfbba.js?PID=0B459DF1-2695-3173-882B-64908F679262',
      method: 'POST',
      headers: {
        authority: 'launches.endclothing.com',
        pragma: 'no-cache',
        'cache-control': 'no-cache',
        origin: 'https://launches.endclothing.com',
        'x-distil-ajax': 'ewyvayrwtevdfwfz',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
        'content-type': 'text/plain;charset=UTF-8',
        accept: '*/*',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        referer: this.url,
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9'
      },
      body: dataString
    });

    return this.rp({
      method: 'POST',
      headers: {
        accept: 'application/json',
        'accept-language': 'en-US,en;q=0.9',
        'access-control-allow-credentials': 'true',
        'cache-control': 'no-cache',
        'content-type': 'application/json; charset=UTF-8',
        pragma: 'no-cache',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        referrer: this.url
      },
      uri: 'https://launches-api.endclothing.com/api/account/login',
      json: true,
      body: { email: this.profile.email, password: this.profile.password }
    });
  };

  getAccountInfo = async () => {
    this.rp({
      method: 'GET',
      uri: 'https://launches-api.endclothing.com/api/account',
      json: true
    });
  };

  addAddressToAccount = async account =>
    this.rp({
      method: 'POST',
      uri: 'https://launches-api.endclothing.com/api/addresses',
      json: true,
      body: {
        city: this.profile.deliveryCity,
        company: '',
        countryId: ENDCountries[this.profile.deliveryCountry],
        firstName: this.profile.deliveryFirstName,
        lastName: this.profile.deliveryLastName,
        postCode: this.profile.deliveryZip,
        street1: this.profile.deliveryAddress,
        street2: this.profile.deliveryZip,
        telephone: this.profile.phone,
        defaultBilling: false,
        defaultShipping: true,
        customerId: account.id
      }
    });

  addPaymentMethod = async () => {
    const token = await this.rp({
      method: 'POST',
      uri: 'https://launches-api.endclothing.com/gateway/token',
      body: {},
      json: true
    });
    const client = new braintree.api.Client({
      clientToken: token.value
    });
    client.tokenizeCard(
      {
        number: this.profile.card.cardNumber,
        cardholderName:
          this.profile.card.paymentCardholdersName ||
          `${this.profile.billingFirstName} ${this.profile.billingLastName}`,
        expirationMonth: this.profile.card.expMonth,
        expirationYear: this.profile.card.expYear,
        cvv: this.profile.card.cvv
      },
      (err, nonce) => {
        console.log(err);
        console.log(nonce);
      }
    );
  };

  getPaymentMethods = () =>
    this.rp({
      method: 'GET',
      uri: 'https://launches-api.endclothing.com/api/payment-methods',
      json: true
    });

  stop = () => {
    this.run = false;
    this.changeStatus('Stopped');
  };

  makeEntry = async () => {
    ValidateSchema(ENDSchema, { ...this.profile });
    this.changeStatus('Logging Into Account');
    const authToken = await this.login();
    console.log(authToken);
    this.changeStatus('Getting Account Info');
    const accountInfo = await this.getAccountInfo();
    if (accountInfo.addresses.length === 0) {
      await this.addAddressToAccount(accountInfo);
    }
    const paymentMethods = await this.getPaymentMethods();
    if (paymentMethods.length === 0) {
      this.addPaymentMethod();
    }
  };
}
