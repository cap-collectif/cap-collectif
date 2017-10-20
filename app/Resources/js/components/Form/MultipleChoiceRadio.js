// @flow
import React from 'react';
import { Field } from 'redux-form';
import { FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';
import component from './Field';
import Other from './Other';

type Props = {
  name: string,
  choices: Array<any>,
  helpText: ?string,
  label?: string | any,
  description?: string,
  validationState?: ?string,
  isOtherAllowed?: ?boolean,
  labelClassName?: ?string,
  disabled?: ?boolean,
  errors?: Array<string>,
};

export class MultipleChoiceRadio extends React.Component<Props> {
  other: Other;

  render() {
    const { name, choices, helpText, validationState, label, ...props } = this.props;

    return (
      <FormGroup validationState={validationState}>
        {label && <ControlLabel bsClass="control-label h4">{label}</ControlLabel>}
        {helpText && <HelpBlock>{helpText}</HelpBlock>}

        {choices.map((choice, index) => (
          <Field
            component={component}
            type="radio"
            key={`${name}-${index}`}
            name={name}
            id={`${name}-${index}`}
            value={choice.label}>
            {choice.label}
          </Field>
        ))}
        {props.description && <HelpBlock>{props.description}</HelpBlock>}
        {props.errors && <span className="error-block">{props.errors}</span>}
      </FormGroup>
    );
  }
}
