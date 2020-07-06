/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { RegisterForm } from './RegisterForm';
import { formMock, $refType, $fragmentRefs } from '~/mocks';

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
    const wrapper = shallow(<RegisterForm event={event} user={user} {...formMock} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no user', () => {
    const wrapper = shallow(<RegisterForm event={event} {...formMock} />);
    expect(wrapper).toMatchSnapshot();
  });
});
