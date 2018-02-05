/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import RemainingTime from './RemainingTime';

describe('<RemainingTime />', () => {
  it('should not render 0 days if no props', () => {
    const wrapper = shallow(<RemainingTime />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render the number of days if hours is not provided', () => {
    const wrapper = shallow(<RemainingTime days={2} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render the number of hours if provided', () => {
    const wrapper = shallow(<RemainingTime hours={2} />);
    expect(wrapper).toMatchSnapshot();
  });
});
