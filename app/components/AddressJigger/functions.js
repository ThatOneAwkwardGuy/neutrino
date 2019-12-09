import { translations } from '../../constants/constants';

export const makeid = length => {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i += 1)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text.toUpperCase();
};

export const jigAddress = addressString => {
  const jigs = new Set([addressString]);
  const lines = addressString.split('\n');
  const parts = lines[0].split(' ');
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    translations.forEach(entry => {
      const possibleJigs = [];
      entry.forEach(val => {
        if (part.toLowerCase() === val) {
          entry.forEach(value => {
            if (value !== val && (!value.endsWith('.') || part.endsWith('.'))) {
              possibleJigs.push(value);
            }
          });
        }
      });
      possibleJigs.forEach(jig => {
        jigs.forEach(address => {
          let fullJig = '';
          const valueLines = address.split('\n');
          const valueParts = valueLines[0].split(' ');
          for (let i = 0; i < valueParts.length; i += 1) {
            fullJig += `${i !== index ? valueParts[i] : jig} `;
          }
          fullJig = fullJig.substring(0, fullJig.length - 1);
          for (let i = 1; i < valueLines.length; i += 1) {
            fullJig += valueLines[i];
          }
          jigs.add(fullJig);
        });
      });
    });
  }
  if (parts.length >= 3) {
    jigs.forEach(address => {
      if (lines.length === 1 && !address.includes('\n')) {
        const addressParts = address.split(' ');
        for (let i = 2; i < addressParts.length; i += 1) {
          let splitAddress = '';
          for (let j = 0; j < i; j += 1) {
            splitAddress += `${addressParts[j]} `;
          }
          splitAddress = `${splitAddress.substring(
            0,
            splitAddress.length - 1
          )}\n`;
          for (let j = i; j < addressParts.length; j += 1) {
            splitAddress += `${addressParts[j]} `;
          }
          jigs.add(splitAddress.substring(0, splitAddress.length - 1));
        }
      }
    });
  }
  return jigs;
};

export const jigAddresses = (
  address1,
  city,
  aptSuite,
  region,
  country,
  zipcode,
  fourCharPrefixBool,
  quantity
) => {
  const jiggedAddresses = Array.from(jigAddress(address1));
  const newJiggedAddresses = new Set(
    jiggedAddresses.map(address => address.replace('\n', ' '))
  );
  let finalJiggedAddresses = Array.from(newJiggedAddresses).map(address =>
    `${address}\n${city}\n${aptSuite}\n${region}\n${country}\n${zipcode}`.trim()
  );
  if (finalJiggedAddresses.length < parseInt(quantity, 10)) {
    const extraAddress = new Set();
    let counter = 0;
    while (
      extraAddress.size < parseInt(quantity, 10) &&
      counter < quantity * 100
    ) {
      counter += 1;
      if (fourCharPrefixBool) {
        extraAddress.add(
          `${makeid(
            4
          )} ${address1}\n${city}\n${aptSuite}\n${region}\n${country}\n${zipcode}`.trim()
        );
      } else {
        extraAddress.add(
          randomlyJig(
            `${address1}\n${city}\n${aptSuite}\n${region}\n${country}\n${zipcode}`.trim()
          )
        );
      }
    }
    console.log(extraAddress);
    finalJiggedAddresses = finalJiggedAddresses.concat(
      Array.from(extraAddress)
    );
  }
  return finalJiggedAddresses;
};

export const changeLetterToNumber = string => {
  const stringArray = string.split('');
  const possibleLetters = ['E', 'I', '0', 'l', 'o'];
  const conversions = {
    E: '3',
    I: '1',
    l: '1',
    O: '0',
    o: '0'
  };
  const matchingIndexes = stringArray
    .map((char, index) => (possibleLetters.includes(char) ? index : undefined))
    .filter(char => char !== undefined);
  const randomIndex =
    matchingIndexes[Math.floor(Math.random() * matchingIndexes.length)];
  stringArray[randomIndex] = conversions[stringArray[randomIndex]];
  return stringArray.join('');
};

export const randomlyCapitalize = string =>
  string
    .split('')
    .map(v => {
      const chance = Math.round(Math.random());
      return chance ? v.toUpperCase() : v.toLowerCase();
    })
    .join('');

export const randomlyCapitalizeAndLetterToNumber = string =>
  changeLetterToNumber(randomlyCapitalize(string));

export const randomlyJig = string => {
  const functions = [
    changeLetterToNumber,
    randomlyCapitalize,
    randomlyCapitalizeAndLetterToNumber
  ];
  const randomFunction =
    functions[Math.floor(Math.random() * functions.length)];
  return randomFunction(string);
};
