/*
  Mixin used for validating fields in form
  Only usable with ReactBootstrap Input
*/

import Validator from '../services/Validator';

const ValidatorMixin = {

  getInitialState() {
    return {
      form: null,
      fields: {},
      submitted: false,
    };
  },

  initForm(ref, rules) {
    const fields = {};
    $.each(rules, (key, constraints) => {
      fields[key] = {
        constraints,
        errors: [],
      };
    });
    this.setState({
      form: this.refs[ref],
      fields,
    });
  },

  isValid(ref) {
    if (ref) {
      return this.isFieldValid(ref);
    }

    let valid = true;

    Object.keys(this.state.fields).map((key) => {
      if (!this.isFieldValid(key)) {
        valid = false;
      }
    });

    return valid;
  },

  isFieldValid(ref) {
    if (this.refs[ref]) {
      if (this.state.fields[ref]) {
        const input = this.refs[ref];
        const value = input.props.type === 'checkbox' ? input.getChecked() : input.getValue();
        const errors = (new Validator(value, this.state.fields[ref].constraints)).getErrors();
        const fields = this.state.fields;
        fields[ref].errors = errors;
        this.setState({
          fields,
        });
        return errors.length === 0;
      }
      return true;
    }
    return false;
  },

  getGroupStyle(field) {
    return this.getErrorsMessages(field).length > 0 ? 'has-warning' : this.state.submitted ? 'has-success' : '';
  },

  getErrorsMessages(ref) {
    if (ref && this.state.fields[ref]) {
      return this.state.fields[ref].errors;
    }
    return [];
  },

};

export default ValidatorMixin;
