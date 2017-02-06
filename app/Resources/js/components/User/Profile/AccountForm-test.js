/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { AccountForm } from './AccountForm';
import IntlData from '../../../translations/FR';

describe('<AccountForm />', () => {
  const dispatch = () => {};
  const handleSubmit = () => {};

  it('should render a form', () => {
    const wrapper = shallow(
      <AccountForm
        dispatch={dispatch}
        handleSubmit={handleSubmit}
        confirmationEmailResent={false}
        {...IntlData}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a form with an alert if submitted password is wrong', () => {
    const wrapper = shallow(
      <AccountForm
        dispatch={dispatch}
        handleSubmit={handleSubmit}
        confirmationEmailResent={false}
        error="user.confirm.wrong_password"
        {...IntlData}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a form with information about new email', () => {
    const wrapper = shallow(
      <AccountForm
        dispatch={dispatch}
        handleSubmit={handleSubmit}
        confirmationEmailResent={false}
        newEmailToConfirm="new-email@test.com"
        {...IntlData}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a form with an info if a confirmation email has been resent', () => {
    const wrapper = shallow(
      <AccountForm
        dispatch={dispatch}
        handleSubmit={handleSubmit}
        confirmationEmailResent
        newEmailToConfirm="new-email@test.com"
        {...IntlData}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
