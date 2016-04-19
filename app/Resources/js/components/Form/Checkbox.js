import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import CheckboxGroup from 'react-checkbox-group';
import Input from './Input';
import Other from './Other';
import classNames from 'classnames';

const Checkbox = React.createClass({
  propTypes: {
    id: PropTypes.string.isRequired,
    field: PropTypes.object.isRequired,
    getGroupStyle: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    renderFormErrors: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    labelClassName: PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      disabled: false,
      labelClassName: '',
    };
  },

  getInitialState() {
    return {
      value: [],
    };
  },

  onChange(e) {
    const checkboxes = Array.from(this.refs.choices.getCheckboxes());
    const values = [];

    checkboxes.forEach((checkbox) => {
      if (checkbox.id !== this.props.field.id + '-choice-other' && checkbox.checked) {
        values.push(checkbox.value);
      }
    });

    if (e.target.type === 'text') {
      values.push(e.target.value);
    }

    this.props.onChange(this.props.field, values);
  },

  empty() {
    this.setState({
      value: [],
    });
    this.other.clear();
    const checkboxes = Array.from(this.refs.choices.getCheckboxes());
    checkboxes.map((checkbox) => {
      $(checkbox).prop('checked', false);
    });
  },

  render() {
    const field = this.props.field;
    const fieldName = 'choices-for-field-' + field.id;

    const labelClasses = {
      'control-label': true,
    };
    labelClasses[this.props.labelClassName] = true;

    const optional = this.getIntlMessage('global.form.optional');

    return (
      <div
        className={'form-group ' + this.props.getGroupStyle(field.id)}
        id={this.props.id}
      >
        <label className={classNames(labelClasses)}>
          {field.question + (field.required ? '' : optional)}
        </label>
        <span className="help-block">
          {field.helpText}
        </span>
        <CheckboxGroup
          id={fieldName}
          ref={'choices'}
          name={fieldName}
          value={this.state.value}
          onChange={this.onChange}
          className="input-choices"
        >
          {
            this.props.field.choices.map((choice) => {
              const choiceKey = 'choice-' + choice.id;
              return (
                <div key={choiceKey}>
                  <Input
                    id={this.props.id + '_' + choiceKey}
                    name={fieldName}
                    type="checkbox"
                    label={choice.label}
                    value={choice.label}
                    help={choice.description}
                    disabled={this.props.disabled}
                    image={choice.image ? choice.image.url : null}
                  />
                </div>
              );
            })
          }
          {
            this.props.field.isOtherAllowed
            ? <Other
                ref={c => this.other = c}
                field={this.props.field}
                onChange={this.onChange}
                disabled={this.props.disabled}
              />
            : null
          }
        </CheckboxGroup>
        {this.props.renderFormErrors(field.id)}
      </div>
    );
  },

});

export default Checkbox;
