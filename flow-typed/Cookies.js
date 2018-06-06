declare class CookiesStatic {
  set: (key: string, value: any, options: Object) => void,
  getJSON: (key: string) => any,
  get: (key: string) => any,
};

declare var Cookies: CookiesStatic;
