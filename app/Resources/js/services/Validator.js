export const isEmail = (value: ?string): boolean => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return !!(value && re.test(value));
};

export const isUrl = (value: ?string): boolean => {
  const urlPattern = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
  return !value || urlPattern.test(value);
};

class Validator {
  constructor(value, rules) {
    this.value = value;
    this.rules = rules;
  }

  getErrors() {
    const errors = [];
    Object.keys(this.rules).map(rule => {
      const message = {
        message: this.rules[rule].message,
        params: this.rules[rule].messageParams || [],
      };
      switch (rule) {
        case 'min':
          if (!this.min(this.rules[rule].value)) {
            errors.push(message);
          }
          break;
        case 'minHtml':
          if (!this.minHtml(this.rules[rule].value)) {
            errors.push(message);
          }
          break;
        case 'max':
          if (!this.max(this.rules[rule].value)) {
            errors.push(message);
          }
          break;
        case 'isEqual':
          if (!this.isEqual(this.rules[rule].value)) {
            errors.push(message);
          }
          break;
        case 'notEqual':
          if (!this.notEqual(this.rules[rule].value)) {
            errors.push(message);
          }
          break;
        case 'isEmail':
          if (!isEmail(this.value)) {
            errors.push(message);
          }
          break;
        case 'isUrl':
          if (!isUrl(this.value)) {
            errors.push(message);
          }
          break;
        case 'notNull':
          if (!this.notNull()) {
            errors.push(message);
          }
          break;
        case 'notBlank':
          if (!this.notBlank()) {
            errors.push(message);
          }
          break;
        case 'notBlankHtml':
          if (!this.notBlankHtml()) {
            errors.push(message);
          }
          break;
        case 'notEmpty':
          if (!this.notEmpty()) {
            errors.push(message);
          }
          break;
        case 'isTrue':
          if (!this.isTrue()) {
            errors.push(message);
          }
          break;
        case 'minValue':
          if (!this.minValue(this.rules[rule].value)) {
            errors.push(message);
          }
          break;
        case 'maxValue':
          if (!this.maxValue(this.rules[rule].value)) {
            errors.push(message);
          }
          break;
        case 'length':
          if (!this.equalLength(this.rules[rule].value)) {
            errors.push(message);
          }
          break;
        default:
          throw new Error(`The rule ${rule} does not exist in Validator.`);
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

  notNull() {
    return this.value !== null;
  }

  notBlank() {
    return this.notNull() && this.value !== '';
  }

  notBlankHtml() {
    return this.notNull() && $(this.value).text() !== '';
  }

  notEmpty() {
    return this.notNull() && Array.isArray(this.value) && this.value.length > 0;
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

  equalLength(value) {
    return !this.value || this.value.length === value;
  }
}

export default Validator;
