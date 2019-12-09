// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import CircleColor from './CircleColor';

describe('<CircleColor />', () => {
  it('renders correctly', () => {
    const props = {
      editable: true,
      onChange: jest.fn(),
      colors: [
        { name: 'Blue', hexValue: '#3b88fd' },
        { name: 'Green', hexValue: '#3ad116' },
        { name: 'Orange', hexValue: '#f4b721' },
        { name: 'Red', hexValue: '#f75d56' },
        { name: 'Black', hexValue: '#000' },
      ],
      defaultColor: { name: 'Blue', hexValue: '#3b88fd' },
    };
    const wrapper = shallow(<CircleColor {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
