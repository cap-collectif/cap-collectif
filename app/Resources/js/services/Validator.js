class Validator {

  constructor(value) {
    this.value = value;
  }

  min(min) {
    return this.value && this.value.length >= min;
  }

  isEmail() {
    const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,15}(?:\.[a-z]{2})?)$/i;
    return this.value && re.test(this.value);
  }

  isUrl() {
    const urlPattern = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
    console.log(this.value);
    return this.value && urlPattern.test(this.value);
  }

}

export default Validator;
