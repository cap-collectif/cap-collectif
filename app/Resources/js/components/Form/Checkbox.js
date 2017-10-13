// @flow
import React, { PropTypes } from 'react';
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
    label: PropTypes.any,
    renderFormErrors: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    labelClassName: PropTypes.string,
    isReduxForm: PropTypes.bool.isRequired,
    value: PropTypes.array.isRequired,
  },

  other: Other,

  getDefaultProps() {
    return {
      disabled: false,
      labelClassName: '',
      isReduxForm: false,
      value: []
    };
  },

  getInitialState() {
    return {
      mixinValue: [],
    };
  },

  onChange(newValue) {
    const { isReduxForm, onChange, field } = this.props;

    if (isReduxForm) {
      onChange(newValue);

      return;
    }

    this.setState({
      mixinValue: newValue
    });

    onChange(field, newValue);
  },


  onOtherChange(e) {
    const { field } = this.props;
    const checkedValues = this.state.mixinValue.filter((value) => {
      let find = false;
      let i = 0;

      while (i < field.choices.length && !find) {
        if (value === field.choices[i].label) {
          find = true;
        }
        i++;
      }

      return find;
    });

    if (e.target.value) {
      this.onChange([...checkedValues, e.target.value]);
    } else {
      this.onChange(checkedValues);
    }
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
    const { disabled, getGroupStyle, id, labelClassName, label, renderFormErrors, field, value, isReduxForm } = this.props;
    const { mixinValue } = this.state;

    const finalValue = isReduxForm ? value : mixinValue;
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
        <span className="help-block">{field.helpText}</span>
        <CheckboxGroup
          id={fieldName}
          ref={'choices'}
          name={fieldName}
          className="input-choices">
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
                  description={choice.description}
                  disabled={disabled}
                  onChange={event => {
                    const newValue = [...finalValue];

                    if(event.target.checked) {
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
