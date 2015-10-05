class BrowserSupport {
  constructor() {
    this.userAgent = navigator.userAgent;
  }

  isSafari() {
    return this.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
  }

  isIE() {
    return this.userAgent.indexOf('MSIE ') > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./);
  }

  isFormattedDateAvailable() {
    return !this.isSafari() && !this.isIE();
  }

}

export default new BrowserSupport();
