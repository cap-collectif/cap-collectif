// @flow
class LocalStorageService {
  constructor() {
    this.defaultCacheTime = 3600000;
  }

  isValid(key, cacheTime) {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    const cache = JSON.parse(localStorage.getItem(key));
    if (!cache) {
      return false;
    }
    const time = cacheTime || this.defaultCacheTime;
    return new Date().getTime() - cache.timestamp < time;
  }

  get(key) {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const parsedJson = JSON.parse(localStorage.getItem(key));
    return parsedJson ? parsedJson.data : null;
  }

  set(key, data) {
    if (typeof localStorage === 'undefined') {
      return;
    }
    const cache = {
      data,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem(key, JSON.stringify(cache));
  }

  remove(key) {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.removeItem(key);
  }
}

export default new LocalStorageService();
