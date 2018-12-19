/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { intlMock, formMock } from '../../../mocks';
import { UserAdminProfile } from './UserAdminProfile';

describe('<UserAdminProfile/>', () => {
  const props1 = {
    ...formMock,
    intl: intlMock,
    hasValue: {},
    user: {},
  };

  it('should render, with user confirmed by email adn viewer is super admin ', () => {
    const wrapper = shallow(
      // $FlowFixMe
      <UserAdminProfile
        {...props1}
        userTypes={[{ id: 1, name: 'type_1' }]}
        features={{ user_type: true }}
        isViewerOrSuperAdmin
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render, with user not confirmed by email adn viewer not super admin', () => {
    const wrapper = shallow(
      // $FlowFixMe
      <UserAdminProfile
        {...props1}
        userTypes={[{ id: 1, name: 'type_1' }]}
        features={{ user_type: false }}
        isViewerOrSuperAdmin={false}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
