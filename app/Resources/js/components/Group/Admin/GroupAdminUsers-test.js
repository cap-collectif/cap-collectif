// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupAdminUsers } from './GroupAdminUsers';
import { intlMock, formMock } from '../../../mocks';

describe('<GroupAdminUsers />', () => {
  const props = {
    ...formMock,
    intl: intlMock,
    // $FlowFixMe $refType
    group: {
      id: 'group4',
      title: 'Comité de suvi',
      users: {
        edges: [
          {
            // $FlowFixMe $fragmentRefs
            node: {
              id: 'id1',
            },
          },
        ],
      },
    },
  };

  const SuccessDeleteUser = {
    valid: false,
    userIsDeleted: true,
    userIsNotDeleted: false,
    submitFailed: false,
    submitSucceeded: false,
  };

  const FailDeleteUser = {
    valid: false,
    userIsDeleted: false,
    userIsNotDeleted: true,
    submitFailed: false,
    submitSucceeded: false,
  };

  const SuccessAddUser = {
    valid: true,
    userIsDeleted: false,
    userIsNotDeleted: false,
    submitFailed: false,
    submitSucceeded: true,
  };

  const FailAddUser = {
    valid: false,
    userIsDeleted: false,
    userIsNotDeleted: false,
    submitFailed: true,
    submitSucceeded: false,
  };

  it('render correctly group admin user with confirmation notification when deleting a user', () => {
    const wrapper = shallow(<GroupAdminUsers {...props} {...SuccessDeleteUser} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly group admin user with error notification when deleting a user', () => {
    const wrapper = shallow(<GroupAdminUsers {...props} {...FailDeleteUser} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly group admin user with confirmation notification when adding a user', () => {
    const wrapper = shallow(<GroupAdminUsers {...props} {...SuccessAddUser} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly group admin user with error notification when adding a user', () => {
    const wrapper = shallow(<GroupAdminUsers {...props} {...FailAddUser} />);
    expect(wrapper).toMatchSnapshot();
  });
});
