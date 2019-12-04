// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EventListStatusFilter } from './EventListStatusFilter';

describe('<EventListStatusFilters />', () => {
  it('renders correctly with finished status & true show state', () => {
    const wrapper = shallow(<EventListStatusFilter status="finished" />);
    wrapper.setState({ show: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with ongoing-and-future status', () => {
    const wrapper = shallow(<EventListStatusFilter screen="mobile" status="ongoing-and-future" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with all status', () => {
    const wrapper = shallow(<EventListStatusFilter screen="desktop" status="all" />);
    expect(wrapper).toMatchSnapshot();
  });
});
