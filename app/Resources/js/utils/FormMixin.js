import Validator from '../services/Validator';

const FormMixin = {
  // This will be easy to use as an higher-order Component

  isValid() {
    let isValid = true;
    Object.keys(this.formValidationRules).map(key => {
      if (!this.validate(key)) {
        isValid = false;
      }
    });

    return isValid;
  },

  validate(ref) {
    if (this.formValidationRules[ref]) {
      const value =
        this.state.custom && this.state.custom[ref] !== undefined
          ? this.state.custom[ref]
          : this.state.form[ref];
      const errors = new Validator(value, this.formValidationRules[ref]).getErrors();

      const formErrors = this.state.errors;
      formErrors[ref] = errors;
      this.setState({ errors: formErrors });

      return errors.length === 0;
    }
  },

  getGroupStyle(field) {
    const { isSubmitting } = this.props;
    return this.getErrorsMessages(field).length > 0
      ? 'has-warning'
      : isSubmitting ? 'has-success' : '';
  },

  getErrorsMessages(ref) {
    if (ref && this.state.errors[ref]) {
      return this.state.errors[ref];
    }
    return [];
  },
};

export default FormMixin;
