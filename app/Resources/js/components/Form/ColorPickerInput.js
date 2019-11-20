// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { ChromePicker } from 'react-color';
import type { FieldProps } from 'redux-form';
import { ControlLabel, FormControl, FormGroup, InputGroup } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

type Props = {
  id: string,
  label: string,
} & FieldProps;

type State = {|
  showPicker: boolean,
|};

const ColorPickerContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  position: absolute;
  z-index: 50;
`;

const ColorPickerCloser: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

class ColorPickerInput extends React.Component<Props, State> {
  state = {
    showPicker: false,
  };

  render() {
    const { input, label, id, meta } = this.props;
    const { showPicker } = this.state;

    return (
      <FormGroup validationState={meta.error ? 'error' : null}>
        {label && <ControlLabel htmlFor={id}>{label}</ControlLabel>}
        <InputGroup>
          <InputGroup.Addon
            onClick={() => {
              this.setState({ showPicker: true });
            }}
            style={{ backgroundColor: input.value }}></InputGroup.Addon>
          <FormControl
            {...input}
            onBlur={() => {
              this.setState({ showPicker: false });
            }}
          />
        </InputGroup>
        {showPicker && (
          <ColorPickerContainer>
            <ColorPickerCloser
              aria-hidden
              onClick={() => {
                this.setState({ showPicker: false });
              }}
            />
            <ChromePicker color={input.value} onChange={color => input.onChange(color.hex)} />
          </ColorPickerContainer>
        )}
        {meta.error && (
          <span className="error-block hidden-print" id={`${id ? `${id}-error` : ''}`}>
            <FormattedMessage id={meta.error} />
          </span>
        )}
      </FormGroup>
    );
  }
}

export default ColorPickerInput;
