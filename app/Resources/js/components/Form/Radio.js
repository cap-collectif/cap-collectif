import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import RadioGroup from 'react-radio';
import classNames from 'classnames';
import Input from './Input';
import Other from './Other';
import ButtonBody from '../Reply/Form/ButtonBody';

const Radio = React.createClass({
  propTypes: {
    id: PropTypes.string.isRequired,
    field: PropTypes.object.isRequired,
    getGroupStyle: PropTypes.func.isRequired,
    renderFormErrors: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    label: PropTypes.any,
    labelClassName: PropTypes.string,
    isReduxForm: PropTypes.bool.isRequired,
    checkedValue: PropTypes.string,
  },

  getDefaultProps() {
    return {
      disabled: false,
      labelClassName: 'h5',
      isReduxForm: false,
    };
  },

  onChange(e, value) {
    this.reverseOnChange(value, e);
  },

  reverseOnChange(value, e) {
    const { field, onChange, isReduxForm } = this.props;
    if (field.isOtherAllowed) {
      const otherRadioElement = Array.from(
        ReactDOM.findDOMNode(this.other).getElementsByTagName('*'),
      ).find(node => {
        return node.type === 'radio';
      });
      if (otherRadioElement.id !== e.target.id && e.target.type !== 'text') {
        this.other.clear();
      }
    }

    if (isReduxForm) {
      onChange(value);

      return;
    }

    onChange(field, value);
  },

  empty() {
    this.other.clear();
    const radioElements = Array.from(
      ReactDOM.findDOMNode(this.radioGroup).getElementsByTagName('input'),
    ).filter(node => {
      return node.type === 'radio';
    });
    radioElements.map(radio => {
      $(radio).prop('checked', false);
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
      checkedValue,
    } = this.props;
    const field = this.props.field;
    const fieldName = `choices-for-field-${field.id}`;

    const labelClasses = {
      'control-label': true,
    };
    labelClasses[labelClassName] = true;

    return (
      <div className={`form-group ${getGroupStyle(field.id)}`} id={id}>
        <label htmlFor={id} className={classNames(labelClasses)}>
          {label}
        </label>
        {field.description && (
          <div style={{ paddingTop: 15, paddingBottom: 25 }}>
            <ButtonBody body={field.description || ''} />
          </div>
        )}
        <span className="help-block">{field.helpText}</span>
        <RadioGroup
          value={checkedValue}
          ref={c => (this.radioGroup = c)}
          name={fieldName}
          onChange={this.reverseOnChange}>
          {field.choices.map(choice => {
            const choiceKey = `choice-${choice.id}`;
            return (
              <Input
                key={choiceKey}
                id={`${id}_${choiceKey}`}
                name={fieldName}
                type="radio"
                value={choice.label}
                description={choice.description}
                disabled={disabled}
                image={choice.image ? choice.image.url : null}>
                {choice.label}
              </Input>
            );
          })}
          {this.props.field.isOtherAllowed ? (
            <Other
              ref={c => (this.other = c)}
              field={this.props.field}
              onChange={this.onChange}
              disabled={disabled}
            />
          ) : null}
        </RadioGroup>
        {renderFormErrors(field.id)}
      </div>
    );
  },
});

export default Radio;
