// @flow
import React from 'react';
import { Field } from 'redux-form';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';
import { FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';
import component from './Field';

type Props = {
  name: string,
  choices: Array<Object>,
  helpText: ?string,
  label?: string | any,
  description?: string,
  validationState?: ?string,
  isOtherAllowed?: ?boolean,
  labelClassName?: ?string,
  disabled?: ?boolean,
  errors?: Array<string>,
  value: ?Object,
  change: (field: string, value: any) => void,
};

type State = {
  otherChecked: boolean,
};

export class MultipleChoiceRadio extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      otherChecked: false,
    };
  }

  checkOtherRadio = () => {
    this.props.change(`${this.props.name}.value.labels`, []);
    // $FlowFixMe
    ReactDOM.findDOMNode(this.textField)
      .getElementsByTagName('input')[0]
      .focus();

    this.setState({ otherChecked: true });
  };

  uncheckOtherRadio = () => {
    this.props.change(`${this.props.name}.value.other`, null);
    this.setState({ otherChecked: false });
  };

  normalize = (newValue: string) => {
    return [newValue];
  };

  render() {
    const {
      disabled,
      name,
      choices,
      helpText,
      validationState,
      label,
      value,
      ...props
    } = this.props;

    const finalValue = value && Array.isArray(value.labels) ? value.labels[0] : undefined;
    const otherValue = value ? value.other : undefined;

    console.log(choices.map((choice) => choice));

    return (
      <div>
        <FormGroup validationState={validationState}>
          {label && <ControlLabel bsClass="control-label">{label}</ControlLabel>}
          {helpText && <HelpBlock>{helpText}</HelpBlock>}

          {choices.map((choice, index) => (
            <Field
              component={component}
              type="radio"
              key={`${name}-${index}`}
              name={`${name}.value.labels`}
              id={`${name}-${index}`}
              disabled={disabled}
              radioChecked={finalValue === choice.label}
              onChange={this.uncheckOtherRadio}
              normalize={this.normalize}
              radioImage={choice.image}
              value={choice.label}>
              {choice.label}
            </Field>
          ))}

          {props.isOtherAllowed && (
            <div className="other-field" id={`${name}-other-value-row`}>
              <div className="other-field__input">
                <Field
                  component={component}
                  type="radio"
                  disabled={disabled}
                  name={`${name}-other-value-field`}
                  id={`${name}-other-value`}
                  radioChecked={this.state.otherChecked || !!otherValue}
                  onChange={this.checkOtherRadio}
                  value="other">
                  {<FormattedMessage id="reply.other" />}
                </Field>
              </div>
              <div className="other-field__value">
                <Field
                  component={component}
                  type="text"
                  name={`${name}.value.other`}
                  id={`${name}.value.other`}
                  placeholder="reply.your_response"
                  value={otherValue}
                  disabled={disabled}
                  onFocus={this.checkOtherRadio}
                  // $FlowFixMe
                  ref={c => (this.textField = c)}
                />
              </div>
            </div>
          )}

          {props.description && <HelpBlock>{props.description}</HelpBlock>}
          {props.errors && <span className="error-block">{props.errors}</span>}
        </FormGroup>
      </div>
    );
  }
}
