// @flow
import React, { Component } from 'react';
import { RadioGroup, RadioButton } from 'react-radio-buttons';
import withColors from '../Utils/withColors';

type Field = {
  id: string,
  choices: Array<Object>,
};

type Props = {
  id: string,
  field: Field,
  value: string,
  onChange: () => {},
  backgroundColor: ?string,
  disabled: ?boolean,
};

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
        return '#707070';
    }
  };

  render() {
    const { field, value, id, onChange, disabled } = this.props;
    return (
      <React.Fragment>
        <RadioGroup
          key={id}
          horizontal
          className="hidden-print form-fields"
          id={id}
          onChange={onChange}>
          {field.choices.map(choice => (
            <RadioButton
              key={choice.id}
              disabled={disabled}
              value={choice.label}
              iconSize={20}
              pointColor={this.getColor(choice.color)}
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
      </React.Fragment>
    );
  }
}

export default withColors(RadioButtons);
