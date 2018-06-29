// @flow
import * as React from 'react';
import { CheckboxGroup } from 'react-checkbox-group';
import classNames from 'classnames';
import Input from './Input';
import Other from './Other';
import ButtonBody from '../Reply/Form/ButtonBody';

type Props = {
  id: string,
  field: Object,
  getGroupStyle: Function,
  onChange: Function,
  onBlur?: Function,
  label?: any,
  renderFormErrors: Function,
  disabled?: boolean,
  labelClassName?: string,
  value: Object,
  errors?: any,
  other?: $FlowFixMe,
};

type State = {
  currentValue: Array<$FlowFixMe>,
};

class Checkbox extends React.Component<Props, State> {
  static DefaultProps = {
    disabled: false,
    labelClassName: '',
    value: {},
  };

  state = {
    currentValue: [],
  };

  onChange = (newValue: $FlowFixMe) => {
    const { onChange, value } = this.props;
    const otherValue = value.other;

    if (Array.isArray(newValue)) {
      onChange({ labels: newValue, other: otherValue });

      this.setState({
        currentValue: newValue,
      });
    } else {
      onChange(newValue);
    }
  };

  onOtherChange = (e: Event, changeValue: $FlowFixMe) => {
    const { value } = this.props;
    const values = value.labels ? value.labels : [];

    this.onChange({
      labels: values,
      other: changeValue || null,
    });
  };

  empty = () => {
    // $FlowFixMe
    this.other.clear();
    const checkboxes = Array.from(this.refs.choices.getCheckboxes());
    checkboxes.map(checkbox => {
      $(checkbox).prop('checked', false);
    });
  };

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
    } = this.props;

    const finalValue = value.labels ? value.labels : [];

    const otherValue = value.other ? value.other : '';
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
          <div style={{ paddingBottom: 15 }}>
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
          {field.isOtherAllowed ? (
            <Other
              // $FlowFixMe
              ref={c => (this.other = c)}
              value={otherValue}
              field={field}
              onChange={this.onOtherChange}
              disabled={disabled}
            />
          ) : null}
        </CheckboxGroup>
        {renderFormErrors(field.id)}
      </div>
    );
  }
}

export default Checkbox;
