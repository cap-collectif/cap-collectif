// @flow
import * as React from 'react';
import ChromePicker from 'react-color/lib/Chrome';

type Props = {
  input: {
    value: string,
    onChange: string => void,
  },
};

class ColorPicker extends React.Component<Props> {
  render() {
    const {
      input: { value, onChange },
    } = this.props;
    return <ChromePicker color={value} onChangeComplete={color => onChange(color.hex)} />;
  }
}

export default ColorPicker;
