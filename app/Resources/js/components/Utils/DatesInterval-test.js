// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { DatesInterval } from './DatesInterval';

describe('<DatesInterval />', () => {
  const props1 = {
    startAt: '2018-01-26T03:00:00+01:00',
    endAt: '2018-02-04T00:03:00+01:00',
    fullDay: true,
  };

  const props2 = {
    startAt: '2018-01-26T03:00:00+01:00',
    endAt: '2018-02-04T00:00:00+01:00',
    fullDay: true,
  };

  const props3 = {
    startAt: '2018-01-26T00:00:00+01:00',
    endAt: '2018-02-04T04:00:00+01:00',
    fullDay: true,
  };

  const props4 = {
    startAt: '2018-01-26T00:00:00+01:00',
    endAt: '2018-02-04T00:00:00+01:00',
    fullDay: true,
  };

  const props5 = {
    startAt: '2018-01-26T03:00:00+01:00',
    fullDay: true,
  };

  const props6 = {
    endAt: '2018-02-10T09:00:24+00:00',
    fullDay: true,
  };

  const props7 = {
    endAt: '2018-02-10T00:00:00+00:00',
    fullDay: true,
  };

  const props8 = {
    endAt: '2017-02-01T00:00:00+00:00',
    fullDay: true,
  };

  const props9 = {
    fullDay: true,
  };

  it('should render a full date', () => {
    const wrapper = shallow(<DatesInterval {...props1} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a full date without end time', () => {
    const wrapper = shallow(<DatesInterval {...props2} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a full date without start time', () => {
    const wrapper = shallow(<DatesInterval {...props3} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a full date without end & start time', () => {
    const wrapper = shallow(<DatesInterval {...props4} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly start date', () => {
    const wrapper = shallow(<DatesInterval {...props5} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly end date', () => {
    (Date: any).now = jest.fn(() => 1517848349000); // 5/02/2018
    const wrapper = shallow(<DatesInterval {...props6} />); // 10/02/2018
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly end date without end time', () => {
    (Date: any).now = jest.fn(() => 1517848349000); // 5/02/2018
    const wrapper = shallow(<DatesInterval {...props7} />); // 10/02/2018
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly past date', () => {
    (Date: any).now = jest.fn(() => 1517848349000); // 5/02/2018
    const wrapper = shallow(<DatesInterval {...props8} />); // 01/02/2018
    expect(wrapper).toMatchSnapshot();
  });

  it('should render null', () => {
    const wrapper = shallow(<DatesInterval {...props9} />);
    expect(wrapper).toMatchSnapshot();
  });
});
