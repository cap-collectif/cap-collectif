// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupAdminImportUsersForm } from './GroupAdminImportUsersForm';
import { intlMock } from '../../../mocks';

describe('<GroupAdminImportUsersForm />', () => {
  const props = {
    show: true,
    onClose: jest.fn(),
    dispatch: jest.fn(),
    group: {
      id: 'group4',
    },
    intl: intlMock,
    handleSubmit: jest.fn(),
  };

  it('render correctly', () => {
    const wrapper = shallow(<GroupAdminImportUsersForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
