// const rp = require('request-promise');
// const HttpsProxyAgent = require('https-proxy-agent');
// const _ = require('lodash');

// export default class Supreme {
//   constructor(
//     profile,
//     category,
//     style,
//     size,
//     status,
//     proxy,
//     keywords,
//     forceUpdate,
//     incrementSupremeCheckouts,
//     settings
//   ) {
//     this.profile = profile;
//     this.style = style;
//     this.category = category;
//     this.size = size;
//     this.status = status;
//     this.keywords = keywords;
//     this.proxy = proxy;
//     this.forceUpdate = forceUpdate;
//     this.incrementSupremeCheckouts = incrementSupremeCheckouts;
//     this.settings = settings;
//     this.cookieJar = rp.jar();
//     this.rp = rp.defaults({
//       headers: {
//         'User-Agent':
//           'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
//       },
//       agent: proxy !== '' ? new HttpsProxyAgent(proxy) : null,
//       jar: this.cookieJar
//     });
//   }

//   // processKeywords = keywordsString => {
//   //   if (keywordsString !== '') {
//   //     const keywordsArray = keywordsString.split(' ');
//   //     const positiveKeywords = [];
//   //     const negativeKeywords = [];
//   //     keywordsArray.forEach(element => {
//   //       if (element[0] === '+') {
//   //         positiveKeywords.push(element.substr(1));
//   //       } else if (element[0] === '-') {
//   //         negativeKeywords.push(element.substr(1));
//   //       }
//   //     });
//   //     return {
//   //       positiveKeywords,
//   //       negativeKeywords
//   //     };
//   //   }
//   // };

//   // getProduct = async () => {
//   //   try {
//   //     const response = await this.rp({
//   //       method: 'GET',
//   //       json: true,
//   //       uri: 'http://www.supremenewyork.com/shop.json'
//   //     });
//   //     const categoryOfProducts =
//   //       response.products_and_categories[this.category];
//   //     const product = this.findProductWithKeyword(
//   //       categoryOfProducts,
//   //       this.processKeywords(this.keywords)
//   //     );
//   //     const [styleID, sizeID] = await this.getProductStyleID(
//   //       product.id,
//   //       this.style,
//   //       this.size
//   //     );
//   //     return [product.id, styleID, sizeID];
//   //   } catch (e) {
//   //     console.error(e);
//   //   }
//   // };

//   // processKeywords = keywordsString => {
//   //   if (keywordsString !== '') {
//   //     const keywordsArray = keywordsString.split(' ');
//   //     const positiveKeywords = [];
//   //     const negativeKeywords = [];
//   //     keywordsArray.forEach(element => {
//   //       if (element[0] === '+') {
//   //         positiveKeywords.push(element.substr(1));
//   //       } else if (element[0] === '-') {
//   //         negativeKeywords.push(element.substr(1));
//   //       }
//   //     });
//   //     return {
//   //       positiveKeywords,
//   //       negativeKeywords
//   //     };
//   //   }
//   // };

//   // findProductWithKeyword = (productArray, keywords) => {
//   //   for (const product of productArray) {
//   //     const productName = product.name;
//   //     if (productName !== undefined) {
//   //       const productNameArray = productName
//   //         .toLowerCase()
//   //         .split(/[^a-zA-Z0-9']/);
//   //       if (
//   //         _.difference(keywords.positiveKeywords, productNameArray).length ===
//   //           0 &&
//   //         _.difference(keywords.negativeKeywords, productNameArray).length ===
//   //           keywords.negativeKeywords.length
//   //       ) {
//   //         return product;
//   //       }
//   //     }
//   //   }
//   // };

//   // getProductStyleID = async (productID, color, sizeInput) => {
//   //   try {
//   //     const response = await this.rp({
//   //       method: 'GET',
//   //       json: true,
//   //       uri: `http://www.supremenewyork.com/shop/${productID}.json`
//   //     });
//   //     const { styles } = response;
//   //     if (styles.length === 1) {
//   //       for (const size of styles[0].sizes) {
//   //         if (size !== '' && size.name === sizeInput) {
//   //           return [styles[0].id, size.id];
//   //         }
//   //         return [styles[0].id, size.id];
//   //       }
//   //     } else {
//   //       for (const style of styles) {
//   //         const styleArray = style.name.toLowerCase().split(/[^a-zA-Z0-9']/);
//   //         const styleKeywordsArray = color.toLowerCase().split(/[^a-zA-Z0-9']/);
//   //         if (_.difference(styleKeywordsArray, styleArray).length === 0) {
//   //           const { sizes } = style;
//   //           for (const size of sizes) {
//   //             if (size.name === sizeInput) {
//   //               return [style.id, size.id];
//   //             }
//   //           }
//   //         }
//   //       }
//   //     }
//   //   } catch (e) {
//   //     console.error(e);
//   //   }
//   // };

//   // run = async () => {
//   //   const window =
//   //   const [productID, styleID, sizeID] = await this.getProduct();
//   //   console.log(productID, styleID, sizeID);
//   // };
// }
