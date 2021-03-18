/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { RegisterForm } from './RegisterForm';
import { formMock, $refType, $fragmentRefs, intlMock } from '~/mocks';

const event = {
  $refType,
  id: '123454321',
  adminAuthorizeDataTransfer: true,
};

const user = {
  $fragmentRefs,
  $refType,
  username: 'Username test',
};

describe('<RegisterForm />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <RegisterForm event={event} user={user} {...formMock} onClose={jest.fn()} intl={intlMock} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no user', () => {
    const wrapper = shallow(
      <RegisterForm event={event} {...formMock} onClose={jest.fn()} intl={intlMock} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
