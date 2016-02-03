class Validator {

  constructor(value, rules) {
    this.value = value;
    this.rules = rules;
  }

  getErrors() {
    const errors = [];
    Object.keys(this.rules).map((rule) => {
      switch (rule) {
      case 'min':
        if (!this.min(this.rules[rule].value)) {
          errors.push(this.rules[rule].message);
        }
        break;
      case 'minHtml':
        if (!this.minHtml(this.rules[rule].value)) {
          errors.push(this.rules[rule].message);
        }
        break;
      case 'max':
        if (!this.max(this.rules[rule].value)) {
          errors.push(this.rules[rule].message);
        }
        break;
      case 'isEqual':
        if (!this.isEqual(this.rules[rule].value)) {
          errors.push(this.rules[rule].message);
        }
        break;
      case 'notEqual':
        if (!this.notEqual(this.rules[rule].value)) {
          errors.push(this.rules[rule].message);
        }
        break;
      case 'isEmail':
        if (!this.isEmail()) {
          errors.push(this.rules[rule].message);
        }
        break;
      case 'isUrl':
        if (!this.isUrl()) {
          errors.push(this.rules[rule].message);
        }
        break;
      case 'notNull':
        if (!this.notNull()) {
          errors.push(this.rules[rule].message);
        }
        break;
      case 'notBlank':
        if (!this.notBlank()) {
          errors.push(this.rules[rule].message);
        }
        break;
      case 'notBlankHtml':
        if (!this.notBlankHtml()) {
          errors.push(this.rules[rule].message);
        }
        break;
      case 'isTrue':
        if (!this.isTrue()) {
          errors.push(this.rules[rule].message);
        }
        break;
      case 'minValue':
        if (!this.minValue(this.rules[rule].value)) {
          errors.push(this.rules[rule].message);
        }
        break;
      case 'maxValue':
        if (!this.maxValue(this.rules[rule].value)) {
          errors.push(this.rules[rule].message);
        }
        break;
      default:
        throw new Error('The rule ' + rule + ' does not exist in Validator.');
      }
    });
    return errors;
  }

  min(value) {
    return !this.value || this.value.length >= value;
  }

  minHtml(value) {
    return !this.value || $(this.value).text().length >= value;
  }

  max(value) {
    return !this.value || this.value.length <= value;
  }

  isEqual(value) {
    return this.value.trim() === value.trim();
  }

  notEqual(value) {
    return !this.isEqual(value);
  }

  isEmail() {
    const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,15}(?:\.[a-z]{2})?)$/i;
    return !this.value || re.test(this.value);
  }

  isUrl() {
    const urlPattern = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
    return !this.value || urlPattern.test(this.value);
  }

  notNull() {
    return this.value !== null;
  }

  notBlank() {
    return this.notNull() && this.value !== '';
  }

  notBlankHtml() {
    return this.notNull() && $(this.value).text() !== '';
  }

  isTrue() {
    return !!this.value;
  }

  minValue(value) {
    return !this.value || this.value >= value;
  }

  maxValue(value) {
    return !this.value || this.value <= value;
  }

}

export default Validator;
