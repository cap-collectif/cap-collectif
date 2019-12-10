// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import InputRequirement from './InputRequirement';

describe('<InputRequirement />', () => {
  const props = {
    onChange: jest.fn(),
    onDelete: jest.fn(),
  };
  it('renders correctly in editable mode', () => {
    const wrapper = shallow(<InputRequirement {...props} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('InputRequirement__FormGroupContainer')).toHaveLength(1);
  });
  it('renders correctly with an initialValue in static mode', () => {
    const wrapper = shallow(<InputRequirement {...props} initialValue="Skuuuuuu" />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('InputRequirement__InputStaticContainer')).toHaveLength(1);
  });
});
