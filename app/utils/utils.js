export const upperCaseFirst = string =>
  string.charAt(0).toUpperCase() + string.slice(1);

export const generateUEID = () => {
  let first = Math.random() * 46656;
  let second = Math.random() * 46656;
  first = `000${first.toString(36)}`.slice(-3);
  second = `000${second.toString(36)}`.slice(-3);
  return first + second;
};
