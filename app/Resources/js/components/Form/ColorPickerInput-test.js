// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ColorPickerInput from './ColorPickerInput';

describe('<ColorPickerInput />', () => {
  it('renders correcty', () => {
    const props = {
      id: 'test',
      label: 'test',
      input: {
        name: 'test',
        onBlur: jest.fn(),
        onChange: jest.fn(),
        onDrop: jest.fn(),
        onDragStart: jest.fn(),
        onFocus: jest.fn(),
        value: '#DADADA',
      },
      meta: {
        active: true,
        asyncValidating: false,
        autofilled: false,
        dirty: false,
        dispatch: jest.fn(),
        form: 'test',
        invalid: false,
        pristine: true,
        submitting: false,
        submitFailed: false,
        touched: false,
        valid: true,
        visited: false,
      },
      custom: {},
    };

    const wrapper = shallow(<ColorPickerInput {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
