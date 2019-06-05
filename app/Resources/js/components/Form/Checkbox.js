// @flow
import * as React from 'react';
import classNames from 'classnames';
import Input from './Input';
import Other from './Other';
import ButtonBody from '../Reply/Form/ButtonBody';
import WYSIWYGRender from './WYSIWYGRender';

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
  other?: $FlowFixMe,
};

type State = {
  currentValue: Array<$FlowFixMe>,
};

class Checkbox extends React.Component<Props, State> {
  static defaultProps = {
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

  other: ?React.Component<*, *>;

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
      <div className={`form-group ${getGroupStyle(field.id)} form-fields`} id={id}>
        {label && (
          <label htmlFor={fieldName} className={classNames(labelClasses)}>
            {label}
          </label>
        )}
        {field.helpText && <span className="help-block">{field.helpText}</span>}
        {field.description && <ButtonBody body={field.description || ''} />}

        {field.choices &&
          field.choices.map(choice => {
            const choiceKey = `choice-${choice.id}`;
            const choiceValue = choice.useIdAsValue && choice.id ? choice.id : choice.label;
            return (
              <div key={choiceKey} className="choice-field">
                <Input
                  id={`${id}_${choiceKey}`}
                  name={fieldName}
                  type="checkbox"
                  helpPrint={false}
                  value={choiceValue}
                  checked={finalValue.indexOf(choiceValue) !== -1}
                  disabled={disabled}
                  onBlur={event => {
                    if (onBlur) onBlur(event.preventDefault());
                  }}
                  onChange={event => {
                    const newValue = [...finalValue];

                    if (event.target.checked) {
                      newValue.push(choiceValue);
                    } else {
                      newValue.splice(newValue.indexOf(choiceValue), 1);
                    }
                    this.onChange(newValue);
                  }}
                  image={choice.image ? choice.image.url : null}>
                  {choice.label}
                </Input>
                {choice.description && (
                  <WYSIWYGRender
                    className="mb-20 pl-20 choice-description"
                    value={choice.description}
                    tagName="i"
                  />
                )}
              </div>
            );
          })}
        {field.isOtherAllowed ? (
          <Other
            ref={c => {
              this.other = c;
            }}
            value={otherValue}
            field={field}
            onChange={this.onOtherChange}
            disabled={disabled}
          />
        ) : null}
        {renderFormErrors(field.id)}
      </div>
    );
  }
}

export default Checkbox;
