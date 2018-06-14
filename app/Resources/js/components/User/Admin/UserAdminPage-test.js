/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { UserAdminPage } from './UserAdminPage';
import { intlMock, formMock } from '../../../mocks';

describe('<UserAdminPage/>', () => {
  const props1 = {
    ...formMock,
    intl: intlMock,
    userId: 'user516',
  };

  it('should render', () => {
    const wrapper = shallow(<UserAdminPage {...props1} />);
    wrapper.setState({
      showModal: true,
    });
    expect(wrapper).toMatchSnapshot();
  });
});
