// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ColorPickerInput from './ColorPickerInput';

const props = {
  onChange: jest.fn(),
  value: '#ABCDEF',
};

describe('<ColorPickerInput />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ColorPickerInput {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
