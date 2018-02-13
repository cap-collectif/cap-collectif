// @flow
import React, { PropTypes } from 'react';
import CheckboxGroup from 'react-checkbox-group';
import classNames from 'classnames';
import Input from './Input';
import Other from './Other';
import ButtonBody from '../Reply/Form/ButtonBody';

const Checkbox = React.createClass({
  propTypes: {
    id: PropTypes.string.isRequired,
    field: PropTypes.object.isRequired,
    getGroupStyle: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    label: PropTypes.any,
    renderFormErrors: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    labelClassName: PropTypes.string,
    isReduxForm: PropTypes.bool.isRequired,
    value: PropTypes.object.isRequired,
    errors: PropTypes.any,
  },

  other: Other,

  getDefaultProps() {
    return {
      disabled: false,
      labelClassName: 'h5',
      isReduxForm: false,
      value: {},
    };
  },

  getInitialState() {
    return {
      mixinValue: [],
      currentValue: [],
    };
  },

  onChange(newValue) {
    const { isReduxForm, onChange, field, value } = this.props;
    const otherValue = value.other ? value.other : null;

    if (isReduxForm) {
      if (Array.isArray(newValue)) {
        onChange({ labels: newValue, other: otherValue });

        this.setState({
          currentValue: newValue,
        });
      } else {
        onChange(newValue);
      }

      return;
    }

    // Without redux form

    let resolveValue;
    if (Array.isArray(newValue)) {
      resolveValue = newValue;
    } else {
      const lastValues = this.state.mixinValue.filter(val => {
        let find = false;
        let i = 0;

        while (i < field.choices.length && !find) {
          if (val === field.choices[i].label) {
            find = true;
          }
          i++;
        }

        return find;
      });

      resolveValue = [...lastValues, newValue];
    }

    this.setState({
      mixinValue: resolveValue,
    });

    onChange(field, resolveValue);
  },

  onOtherChange(e, changeValue) {
    const { isReduxForm, value } = this.props;
    const values = isReduxForm ? value.labels : this.state.mixinValue;

    if (isReduxForm) {
      if (changeValue) {
        this.onChange({ labels: values, other: changeValue });
      } else {
        this.onChange({ labels: values, other: null });
      }

      return;
    }

    this.onChange(changeValue);
  },

  empty() {
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
      field,
      value,
      onBlur,
      isReduxForm,
    } = this.props;
    const { mixinValue, currentValue } = this.state;

    let finalValue = mixinValue;
    if (isReduxForm) {
      finalValue = value.labels ? value.labels : currentValue;
    }

    const otherValue = isReduxForm ? value.other : undefined;
    const fieldName = `choices-for-field-${field.id}`;

    const labelClasses = {
      'control-label': true,
    };
    if (labelClassName) {
      labelClasses[labelClassName] = true;
    }

    return (
      <div className={`form-group ${getGroupStyle(field.id)}`} id={id}>
        {label && (
          <label htmlFor={fieldName} className={classNames(labelClasses)}>
            {label}
          </label>
        )}
        {field.helpText && <span className="help-block">{field.helpText}</span>}
        {field.description && (
          <div style={{ paddingTop: 15, paddingBottom: 25 }}>
            <ButtonBody body={field.description || ''} />
          </div>
        )}
        <CheckboxGroup id={fieldName} ref={'choices'} name={fieldName} className="input-choices">
          {field.choices.map(choice => {
            const choiceKey = `choice-${choice.id}`;
            return (
              <div key={choiceKey}>
                <Input
                  id={`${id}_${choiceKey}`}
                  name={fieldName}
                  type="checkbox"
                  value={choice.label}
                  checked={finalValue.indexOf(choice.label) !== -1}
                  disabledValidation
                  description={choice.description}
                  disabled={disabled}
                  onBlur={event => {
                    if (onBlur) onBlur(event.preventDefault());
                  }}
                  onChange={event => {
                    const newValue = [...finalValue];

                    if (event.target.checked) {
                      newValue.push(choice.label);
                    } else {
                      newValue.splice(newValue.indexOf(choice.label), 1);
                    }

                    this.onChange(newValue);
                  }}
                  image={choice.image ? choice.image.url : null}>
                  {choice.label}
                </Input>
              </div>
            );
          })}
          {this.props.field.isOtherAllowed ? (
            <Other
              ref={c => (this.other = c)}
              value={otherValue}
              isReduxForm={isReduxForm}
              field={this.props.field}
              onChange={this.onOtherChange}
              disabled={disabled}
            />
          ) : null}
        </CheckboxGroup>
        {renderFormErrors(field.id)}
      </div>
    );
  },
});

export default Checkbox;
