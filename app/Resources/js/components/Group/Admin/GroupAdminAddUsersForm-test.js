// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupAdminAddUsersForm } from './GroupAdminAddUsersForm';

describe('<GroupAdminAddUsersForm />', () => {
  const props = {
    group: {
      id: 'group4',
      title: 'Comité de suvi',
      usersConnection: [],
    },
    handleSubmit: jest.fn(),
    dispatch: jest.fn(),
  };

  it('render correctly', () => {
    const wrapper = shallow(<GroupAdminAddUsersForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
