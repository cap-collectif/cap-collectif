// @flow

export const REGEX_EMAIL =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const isEmail = (value: ?string): boolean => {
  return !!(value && REGEX_EMAIL.test(value));
};

export const REGEX_URL =
  /^(https:\/\/)[\w.-]+(?:\.[\w/.-]+)+[\w\-/._~:/?#[\]@!/$&'/(/)/*/+,;=.]+$/gi;

export const isUrl = (value: ?string): boolean => {
  const urlPattern = /^(https:\/\/)[\w.-]+(?:\.[\w/.-]+)+[\w\-/._~:/?#[\]@!/$&'/(/)/*/+,;=.]+$/gi;
  return !value || urlPattern.test(value);
};

export const checkOnlyNumbers = (input: string): boolean => {
  const regexS = /(^-?(\d*,?)?\d*)/gm;
  const regex = new RegExp(regexS);
  const results = regex.exec(input);
  if (input === '-') {
    return false;
  }
  return !!results && results[0] === input;
};

export const checkSiret = (input: string): boolean => {
  const regexS = /\d{14}$/gm;
  const regex = new RegExp(regexS);
  input = input.replace(/\s/g, '');
  const results = regex.exec(input);
  return !!results && results[0] === input;
};

export const checkRNA = (input: string): boolean => {
  const regexS = /W\d{9}$/gm;
  const regex = new RegExp(regexS);
  input = input.replace(/\s/g, '');
  const results = regex.exec(input);
  return !!results && results[0] === input;
};
