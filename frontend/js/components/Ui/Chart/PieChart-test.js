// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import 'jest-styled-components';
import { PieChart } from './PieChart';

const propswithDefaultProps = {
  data: [
    { name: 'ok', value: 896 },
    { name: 'mixed', value: 0 },
    { name: 'not ok', value: 9768678 },
  ],
  colors: ['#fff', '#000', '#F9F9F9'],
};

const props = {
  ...propswithDefaultProps,
  width: '110px',
  height: '479px',
  innerRadius: 15,
  outerRadius: 55,
};

describe('<PieChart />', () => {
  it('renders PieChart', () => {
    const wrapper = shallow(<PieChart {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders PieChart with default props', () => {
    const wrapper = shallow(<PieChart {...propswithDefaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
