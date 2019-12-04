// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import RemainingTime from './RemainingTime';

const props = {
  startAt: '2017-01-10T09:00:24+01:00',
  endAt: '2017-11-25T09:00:24+01:00',
};

describe('<RemainingTime />', () => {
  it('should render correctly remaining time (days left)', () => {
    (Date: any).now = jest.fn(() => 1511341200000);
    const wrapper = shallow(<RemainingTime {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly remaining time (hours left)', () => {
    (Date: any).now = jest.fn(() => 1511582400000);
    const wrapper = shallow(<RemainingTime {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly remaining time (minutes left)', () => {
    (Date: any).now = jest.fn(() => 1511595600000);
    const wrapper = shallow(<RemainingTime {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
