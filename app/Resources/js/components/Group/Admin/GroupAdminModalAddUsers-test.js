// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupAdminModalAddUsers } from './GroupAdminModalAddUsers';

describe('<GroupAdminModalAddUsers />', () => {
  const props = {
    show: true,
    onClose: jest.fn(),
    dispatch: jest.fn(),
    group: {
      id: 'group4',
      title: 'Comité de suvi',
      usersConnection: [],
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<GroupAdminModalAddUsers {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
