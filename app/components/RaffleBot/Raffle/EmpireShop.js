import { ValidateSchema, EmpireShopSchema } from '../schemas';

const rp = require('request-promise');

export default class EmpireShop {
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
    this.stopped = false;
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
    try {
      // eslint-disable-next-line no-await-in-loop
      await this.makeEntry();
    } catch (error) {
      console.error(error);
      this.changeStatus(`Error Submitting Raffle - ${error.message}`);
    }
    this.run = false;
  };

  stop = () => {
    this.stopped = true;
    this.run = false;
    this.changeStatus('Stopped');
  };

  submitEntry = () =>
    this.rp({
      headers: {
        Connection: 'keep-alive',
        'Cache-Control': 'max-age=0',
        Origin: 'http://www.empire-leshop.com',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        Referer: this.url
      },
      method: 'POST',
      followAllRedirects: true,
      uri: 'http://www.empire-leshop.com/boutique/envoi_mail.cfm',
      form: {
        num_formulaire: this.raffleDetails.numFormulaire,
        NOM__LAST_NAME: this.profile.deliveryFirstName,
        Prenom__First_name: this.profile.deliveryLastName,
        Adresse__Address: this.profile.deliveryAddress,
        Complement_residence_Apt_code_: this.profile.deliveryApt,
        CODE_POSTAL__ZIP_CODE: this.profile.deliveryZip,
        VILLE__CITY: this.profile.deliveryCity,
        PAYS__COUNTRY_EU_ONLY: this.profile.delivertCountry,
        email: this.profile.email,
        Taille__Size: this.size.id,
        Your_Instagram_ID__: this.profile.instagram,
        image: this.raffleDetails.image,
        confirmation: this.raffleDetails.captcha,
        dys_liste_champs: this.raffleDetails.dysListeChamps,
        dys_liste_champs_id: this.raffleDetails.dysListeChampsId
      }
    });

  makeEntry = async () => {
    ValidateSchema(EmpireShopSchema, { ...this.profile });
    this.changeStatus('Submitting Entry');
    const entry = await this.submitEntry();
    if (entry.includes('Thank you, your registration to the')) {
      this.changeStatus('Successfully Submitted Entry');
      this.incrementRaffles({
        url: this.url,
        site: this.site,
        size: this.size ? this.size.name : '',
        style: this.style ? this.style.name : ''
      });
    } else {
      this.changeStatus(`Error Submitting Entry`);
    }
  };
}
