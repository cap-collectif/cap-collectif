/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import TagDate from './TagDate';

const date = {
  basic: '2019-12-10T15:37:39.620Z',
  otherFormat: 'Tue Dec 10 2019 16:37:39 GMT+0100',
};

describe('<TagDate />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<TagDate date={date.basic} size="15px" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with other format date', () => {
    const wrapper = shallow(<TagDate date={date.basic} size="15px" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with other size', () => {
    const wrapper = shallow(<TagDate date={date.basic} size="10px" />);
    expect(wrapper).toMatchSnapshot();
  });
});
