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
  if (
    fourCharPrefixBool &&
    finalJiggedAddresses.length < parseInt(quantity, 10)
  ) {
    const fourCharPrefixAddresses = Array(
      parseInt(quantity, 10) - finalJiggedAddresses.length
    )
      .fill()
      .map(() =>
        `${makeid(
          4
        )} ${address1}\n${city}\n${aptSuite}\n${region}\n${country}\n${zipcode}`.trim()
      );
    finalJiggedAddresses = finalJiggedAddresses.concat(fourCharPrefixAddresses);
  }
  return finalJiggedAddresses;
};
