// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupAdminModalImportUsers } from './GroupAdminModalImportUsers';
import { intlMock, $refType } from '../../../mocks';

describe('<GroupAdminModalImportUsers />', () => {
  const props = {
    show: true,
    onClose: jest.fn(),
    dispatch: jest.fn(),
    group: {
      $refType,
      id: 'group4',
      title: 'oui',
      users: { edges: [] },
    },
    intl: intlMock,
    pristine: false,
    submitting: false,
  };

  it('render correctly', () => {
    const wrapper = shallow(<GroupAdminModalImportUsers {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
