// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import CheckboxGroup from 'react-checkbox-group';
import classNames from 'classnames';
import Input from './Input';
import Other from './Other';

const Checkbox = React.createClass({
  propTypes: {
    id: PropTypes.string.isRequired,
    field: PropTypes.object.isRequired,
    getGroupStyle: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.any.isRequired,
    renderFormErrors: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    labelClassName: PropTypes.string,
  },
  mixins: [IntlMixin],
  other: Other,

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
    const { field, onChange } = this.props;
    const checkboxes = Array.from(this.refs.choices.getCheckboxes());
    const values = [];

    checkboxes.forEach(checkbox => {
      if (checkbox.id !== `${field.id}-choice-other` && checkbox.checked) {
        values.push(checkbox.value);
      }
    });

    if (e.target.type === 'text') {
      values.push(e.target.value);
    }

    onChange(field, values);
  },

  empty() {
    this.setState({
      value: [],
    });
    // $FlowFixMe
    this.other.clear();
    const checkboxes = Array.from(this.refs.choices.getCheckboxes());
    checkboxes.map(checkbox => {
      $(checkbox).prop('checked', false);
    });
  },

  render() {
    const {
      disabled,
      getGroupStyle,
      id,
      labelClassName,
      label,
      renderFormErrors,
    } = this.props;
    const field = this.props.field;
    const fieldName = `choices-for-field-${field.id}`;

    const labelClasses = {
      'control-label': true,
    };
    if (labelClassName) {
      labelClasses[labelClassName] = true;
    }

    return (
      <div className={`form-group ${getGroupStyle(field.id)}`} id={id}>
        <label htmlFor={fieldName} className={classNames(labelClasses)}>
          {label}
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
          className="input-choices">
          {this.props.field.choices.map(choice => {
            const choiceKey = `choice-${choice.id}`;
            return (
              <div key={choiceKey}>
                <Input
                  id={`${id}_${choiceKey}`}
                  name={fieldName}
                  type="checkbox"
                  value={choice.label}
                  help={choice.description}
                  disabled={disabled}
                  image={choice.image ? choice.image.url : null}>
                  {choice.label}
                </Input>
              </div>
            );
          })}
          {this.props.field.isOtherAllowed
            ? <Other
                ref={c => (this.other = c)}
                field={this.props.field}
                onChange={this.onChange}
                disabled={disabled}
              />
            : null}
        </CheckboxGroup>
        {renderFormErrors(field.id)}
      </div>
    );
  },
});

export default Checkbox;
