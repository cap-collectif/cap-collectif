// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { formMock, intlMock } from '../../../mocks';
import { RedirectIoAdminPage } from '~/components/User/Admin/RedirectIoAdminPage';

describe('<RedirectIoAdminPage/>', () => {
  const propsEmpty = {
    ...formMock,
    projectKey: { value: '' },
    projectId: '',
    intl: intlMock,
  };

  const propsWithKey = {
    ...formMock,
    projectKey: { value: 'This is a key' },
    projectId: 'This is a key',
    intl: intlMock,
  };
  it('should render empty', () => {
    const wrapper = shallow(<RedirectIoAdminPage {...propsEmpty} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render with key', () => {
    const wrapper = shallow(<RedirectIoAdminPage {...propsWithKey} />);
    expect(wrapper).toMatchSnapshot();
  });
});
