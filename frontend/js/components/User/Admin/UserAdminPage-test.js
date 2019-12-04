/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { UserAdminPage } from './UserAdminPage';

describe('<UserAdminPage/>', () => {
  it('should render', () => {
    const wrapper = shallow(<UserAdminPage userId="user516" dirty={false} />);
    wrapper.setState({
      showModal: true,
    });
    expect(wrapper).toMatchSnapshot();
  });
});
