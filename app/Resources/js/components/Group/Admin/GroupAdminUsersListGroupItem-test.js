// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupAdminUsersListGroupItem } from './GroupAdminUsersListGroupItem';

describe('<GroupAdminUsers />', () => {
  const props = {
    groupId: 'group4',
    // $FlowFixMe $refType
    user: {
      id: 'id1',
      displayName: 'toto',
      biography: 'biooooo',
      email: 'toto@cap-collectif.com',
      phone: null,
      media: { url: 'https://capco.dev' },
    },
    dispatch: jest.fn(),
  };

  it('render correctly', () => {
    const wrapper = shallow(<GroupAdminUsersListGroupItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
