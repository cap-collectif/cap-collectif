/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { intlMock, formMock } from '../../../mocks';
import { UserAdminPassword } from './UserAdminPassword';

describe('<UserAdminPassword/>', () => {
  const props1 = {
    ...formMock,
    intl: intlMock,
  };

  const userIsViewer = {
    isViewer: true,
  };

  const userIsNotViewer = {
    isViewer: false,
  };

  it('should render, with viewer as user', () => {
    const wrapper = shallow(<UserAdminPassword {...props1} user={userIsViewer} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render, with viewer as other user', () => {
    const wrapper = shallow(<UserAdminPassword {...props1} user={userIsNotViewer} />);
    expect(wrapper).toMatchSnapshot();
  });
});
