// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import SelectUserList from './SelectUserList';

const defaultProps = {
  fieldName: 'userList',
  name: 'userList',
  multi: true,
  autoload: true,
  id: 'userList',
  clearable: true,
  disabled: false,
  label: 'userLsit',
  userList: ['user1', 'user2'],
};

describe('<SelectUserList />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<SelectUserList {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with false value', () => {
    const props = {
      ...defaultProps,
      multi: false,
      autoload: false,
      clearable: false,
      disabled: true,
    };
    const wrapper = shallow(<SelectUserList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
