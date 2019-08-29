// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupAdminAddUsersForm } from './GroupAdminAddUsersForm';
import { intlMock } from '../../../mocks';

describe('<GroupAdminAddUsersForm />', () => {
  const props = {
    group: {
      id: 'group4',
      title: 'Comité de suvi',
      users: { edges: [] },
    },
    handleSubmit: jest.fn(),
    dispatch: jest.fn(),
    onClose: jest.fn(),
    intl: intlMock,
  };

  it('render correctly', () => {
    const wrapper = shallow(<GroupAdminAddUsersForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
