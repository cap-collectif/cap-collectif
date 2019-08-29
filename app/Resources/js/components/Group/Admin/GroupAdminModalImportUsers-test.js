// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupAdminModalImportUsers } from './GroupAdminModalImportUsers';
import { intlMock } from '../../../mocks';

describe('<GroupAdminModalImportUsers />', () => {
  const props = {
    show: true,
    onClose: jest.fn(),
    dispatch: jest.fn(),
    group: {
      id: 'group4',
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
