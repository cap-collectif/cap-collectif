/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { intlMock, formMock, $refType } from '../../../mocks';
import { UserAdminPassword } from './UserAdminPassword';

describe('<UserAdminPassword/>', () => {
  const props = {
    ...formMock,
    intl: intlMock,
  };

  const user = {
    $refType,
    id: '1',
  };

  const userIsViewer = {
    ...user,
    isViewer: true,
  };

  const userIsNotViewer = {
    ...user,
    isViewer: false,
  };

  it('should render, with viewer as user', () => {
    const wrapper = shallow(<UserAdminPassword {...props} user={userIsViewer} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render, with viewer as other user', () => {
    const wrapper = shallow(<UserAdminPassword {...props} user={userIsNotViewer} />);
    expect(wrapper).toMatchSnapshot();
  });
});
