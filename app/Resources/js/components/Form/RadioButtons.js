// @flow
import React, { Component } from 'react';
import styled, { type StyledComponent } from 'styled-components';
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

const RadioButtonContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  @media (max-width: 750px) {
    > div > div {
      display: inline;
      > div {
        height: 40px;
      }
    }
  }
  > div > div {
    width: max-content;
    display: inline-block;
    height: 70px;
    margin-bottom: 8px !important;

    > div > div {
      margin-right: 15px;
    }
  }
`;

export class RadioButtons extends Component<Props> {
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
      <RadioButtonContainer>
        <RadioGroup
          style={{ display: 'block' }}
          key={id}
          horizontal
          className="hidden-print form-fields mt-20"
          id={id}
          onChange={onChange}>
          {field.choices.map(choice => (
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
          ))}
        </RadioGroup>
        <div className="visible-print-block form-fields">
          {field.choices.map(choice => (
            <div key={choice.id} className="radio">
              {choice.label}
            </div>
          ))}
        </div>
      </RadioButtonContainer>
    );
  }
}

export default withColors(RadioButtons);
