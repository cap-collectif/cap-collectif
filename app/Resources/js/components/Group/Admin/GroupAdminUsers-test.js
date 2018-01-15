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
      usersConnection: {
        edges: [
          {
            node: {
              id: 'id1',
              displayName: 'toto',
              biography: 'biooooo',
              email: 'toto@cap-collectif.com',
              phone: null,
              media: { url: 'https://capco.dev' },
            },
          },
        ],
      },
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<GroupAdminUsers {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
