// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupAdminUsers } from './GroupAdminUsers';

describe('<GroupAdminUsers />', () => {
  const props = {
    group: {
      id: 'group4',
      title: 'Comité de suvi',
      usersConnection: [],
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<GroupAdminUsers {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
