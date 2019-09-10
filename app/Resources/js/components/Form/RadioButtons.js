// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { RadioGroup, RadioButton } from 'react-radio-buttons';
import withColors from '../Utils/withColors';

type Choice = {|
  id: string,
  label: string,
  color: string,
|};

type Field = {|
  id: string,
  choices: Array<Choice>,
|};

type Props = {|
  id: string,
  field: Field,
  value: string,
  onChange: () => {},
  backgroundColor: ?string,
  disabled: ?boolean,
|};

const RadioButtonContainer = styled.div`
  width: min-content;
  display: inline-block;
  margin-right: 10px;

  > div {
    min-height: 70px;
  }

  @media (max-width: 750px) {
    display: inline;
    > div {
      min-height: 40px;
    }
  }
`;

class RadioButtons extends Component<Props> {
  getColor = (color: string) => {
    const { backgroundColor } = this.props;

    switch (color) {
      case 'SUCCESS':
        return '#5cb85c';
      case 'INFO':
        return '#5bc0de';
      case 'WARNING':
        return '#f0ad4e';
      case 'DANGER':
        return '#d9534f';
      case 'PRIMARY':
        return backgroundColor || '#0388cc';
      default:
        return '#151515';
    }
  };

  render() {
    const { field, value, id, onChange, disabled } = this.props;
    return (
      <React.Fragment>
        <RadioGroup
          style={{ display: 'block' }}
          key={id}
          horizontal
          className="hidden-print form-fields mt-20"
          id={id}
          onChange={onChange}>
          {field.choices.map(choice => (
            <RadioButtonContainer>
              <RadioButton
                key={choice.id}
                disabled={disabled}
                value={choice.label}
                iconSize={20}
                pointColor={this.getColor(choice.color)}
                rootColor="#707070"
                checked={value === choice.label}>
                {choice.label}
              </RadioButton>
            </RadioButtonContainer>
          ))}
        </RadioGroup>
        <div className="visible-print-block form-fields">
          {field.choices.map(choice => (
            <div key={choice.id} className="radio">
              {choice.label}
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

export default withColors(RadioButtons);
