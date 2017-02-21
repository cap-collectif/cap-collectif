// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { LoginButton } from './LoginButton';
import IntlData from '../../../translations/FR';

describe('<LoginButton />', () => {
  const props = {
    className: 'btn-darkest-gray navbar-btn btn--connection',
    ...IntlData,
    onClick: jest.fn(),
  };

  it('renders a button', () => {
    const wrapper = shallow(<LoginButton {...props} />);
    expect(wrapper.find('Button')).toHaveLength(1);
    expect(wrapper.find('Button').prop('bsStyle')).toEqual('default');
    expect(wrapper.find('Button').prop('className')).toEqual('btn-darkest-gray navbar-btn btn--connection');
    expect(wrapper.find('Button').prop('onClick')).toBeDefined();
  });
});
