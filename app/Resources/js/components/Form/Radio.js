import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { IntlMixin } from 'react-intl';
import RadioGroup from 'react-radio';
import Input from './Input';
import Other from './Other';
import classNames from 'classnames';

const Radio = React.createClass({
  propTypes: {
    id: PropTypes.string.isRequired,
    field: PropTypes.object.isRequired,
    getGroupStyle: PropTypes.func.isRequired,
    renderFormErrors: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
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

  onChange(e, value) {
    this.reverseOnChange(value, e);
  },

  reverseOnChange(value, e) {
    if (this.props.field.isOtherAllowed) {
      const otherRadioElement = Array.from(ReactDOM.findDOMNode(this.other).getElementsByTagName('*')).find((node) => {
        return node.type === 'radio';
      });
      if ((otherRadioElement.id !== e.target.id) && e.target.type !== 'text') {
        this.other.clear();
      }
    }
    this.props.onChange(this.props.field, value);
  },

  empty() {
    this.other.clear();
    const radioElements = Array.from(ReactDOM.findDOMNode(this.radioGroup).getElementsByTagName('input')).filter((node) => {
      return node.type === 'radio';
    });
    radioElements.map((radio) => {
      $(radio).prop('checked', false);
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
        <RadioGroup
          ref={c => this.radioGroup = c}
          name={fieldName}
          onChange={this.reverseOnChange}
        >
          {
            this.props.field.choices.map((choice) => {
              const choiceKey = 'choice-' + choice.id;
              return (
                <Input
                  key={choiceKey}
                  id={this.props.id + '_' + choiceKey}
                  name={fieldName}
                  type="radio"
                  label={choice.label}
                  value={choice.label}
                  help={choice.description}
                  disabled={this.props.disabled}
                  image={choice.image ? choice.image.url : null}
                />
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
        </RadioGroup>
        {this.props.renderFormErrors(field.id)}
      </div>
    );
  },

});

export default Radio;
