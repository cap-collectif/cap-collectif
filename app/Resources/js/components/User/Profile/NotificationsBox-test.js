// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { NotificationsBox } from './NotificationsBox';

describe('<NotificationsBox />', () => {
  const dispatch = () => {};

  it('should render a disabled button when the form is invalid', () => {
    const wrapper = shallow(<NotificationsBox dispatch={dispatch} invalid submitting={false} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render and enabled button when the form is valid', () => {
    const wrapper = shallow(
      <NotificationsBox dispatch={dispatch} invalid={false} submitting={false} />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render a disabled button when the form is submitting', () => {
    const wrapper = shallow(<NotificationsBox dispatch={dispatch} invalid={false} submitting />);
    expect(wrapper).toMatchSnapshot();
  });
});
