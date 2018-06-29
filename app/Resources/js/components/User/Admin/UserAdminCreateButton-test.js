/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { UserAdminCreateButton } from './UserAdminCreateButton';
import { intlMock, formMock } from '../../../mocks';

describe('<UserAdminCreateButton/>', () => {
  const props1 = {
    ...formMock,
    intl: intlMock,
  };

  it('should render', () => {
    const wrapper = shallow(<UserAdminCreateButton {...props1} />);
    wrapper.setState({
      showModal: true,
    });
    expect(wrapper).toMatchSnapshot();
  });
});
