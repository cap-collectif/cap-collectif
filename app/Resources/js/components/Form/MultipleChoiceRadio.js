// @flow
import * as React from 'react';
import { Field } from 'redux-form';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';
import { FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';
import component from './Field';
import ButtonBody from '../Reply/Form/ButtonBody';
import WYSIWYGRender from './WYSIWYGRender';

type Props = {
  name: string,
  choices: ?Array<Object>,
  helpText: ?string,
  label?: string | any,
  description?: ?string,
  isOtherAllowed?: ?boolean,
  labelClassName?: ?string,
  disabled?: ?boolean,
  value: ?Object,
  change: (field: string, value: any) => void,
};

type State = {
  otherChecked: boolean,
};

export class MultipleChoiceRadio extends React.Component<Props, State> {
  state = {
    otherChecked: false,
  };

  textField: ?React.Component<*>;

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

  normalize = (newValue: string) => [newValue];

  render() {
    const { disabled, name, choices, helpText, label, value, ...props } = this.props;
    if (!choices) {
      return null;
    }

    const finalValue = value && Array.isArray(value.labels) ? value.labels[0] : undefined;
    const otherValue = value ? value.other : undefined;

    const validationState =
      (typeof finalValue === 'string' && finalValue !== '') ||
      (typeof otherValue === 'string' && otherValue !== '')
        ? 'success'
        : null;

    return (
      <div>
        <FormGroup validationState={validationState}>
          {label && <ControlLabel bsClass="control-label">{label}</ControlLabel>}
          <span className="visible-print-block help-block">
            <FormattedMessage id="one-possible-answer" />
          </span>
          {helpText && <HelpBlock>{helpText}</HelpBlock>}
          {props.description && <ButtonBody body={props.description} />}
          <div className="form-fields">
            {choices.map((choice, index) => (
              <div className="radio-field" key={index}>
                <Field
                  // $FlowFixMe
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
                {choice.description && (
                  <WYSIWYGRender
                    className="mb-20 pl-20 choice-description"
                    value={choice.description}
                    tagName="i"
                  />
                )}
              </div>
            ))}
            {props.isOtherAllowed && (
              <div className="other-field" id={`${name}-other-value-row`}>
                <div className="other-field__input">
                  <Field
                    // $FlowFixMe
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
                    // $FlowFixMe
                    divClassName="reduced"
                    component={component}
                    type="text"
                    name={`${name}.value.other`}
                    id={`${name}.value.other`}
                    placeholder="reply.your_response"
                    value={otherValue}
                    disabled={disabled}
                    onFocus={this.checkOtherRadio}
                    ref={c => {
                      // $FlowFixMe
                      this.textField = c;
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </FormGroup>
      </div>
    );
  }
}
