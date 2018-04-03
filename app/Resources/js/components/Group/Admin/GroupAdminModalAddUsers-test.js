// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupAdminModalAddUsers } from './GroupAdminModalAddUsers';
import { intlMock } from '../../../mocks';

describe('<GroupAdminModalAddUsers />', () => {
  const props = {
    show: true,
    onClose: jest.fn(),
    dispatch: jest.fn(),
    group: {
      id: 'group4',
      title: 'Comité de suvi',
      users: [],
    },
    intl: intlMock,
  };

  it('render correctly', () => {
    const wrapper = shallow(<GroupAdminModalAddUsers {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
