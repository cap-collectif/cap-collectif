/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { AccountBox } from './AccountBox';
import IntlData from '../../../translations/FR';

describe('<AccountBox />', () => {
  const user = {};
  const dispatch = () => {};

  it('should render a disabled button when the form is invalid', () => {
    const wrapper = shallow(
      <AccountBox
        dispatch={dispatch}
        invalid
        submitting={false}
        user={user}
        {...IntlData}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render and enabled button when the form is valid', () => {
    const wrapper = shallow(
      <AccountBox
        dispatch={dispatch}
        invalid={false}
        submitting={false}
        user={user}
        {...IntlData}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render a disabled button when the form is submitting', () => {
    const wrapper = shallow(
      <AccountBox
        dispatch={dispatch}
        invalid={false}
        submitting
        user={user}
        {...IntlData}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
