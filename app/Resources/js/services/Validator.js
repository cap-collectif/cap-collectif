// @flow
export const isEmail = (value: ?string): boolean => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return !!(value && re.test(value));
};

export const isUrl = (value: ?string): boolean => {
  const urlPattern = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
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
