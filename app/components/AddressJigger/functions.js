import { translations } from '../../constants/constants';

export const bs = '';

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
