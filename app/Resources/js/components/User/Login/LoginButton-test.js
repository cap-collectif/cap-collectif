// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { LoginButton } from './LoginButton';

describe('<LoginButton />', () => {
  const props = {
    className: 'btn-darkest-gray navbar-btn btn--connection',
    dispatch: jest.fn(),
    loginWithMonCompteParis: false,
    loginWithOpenId: false,
  };

  it('renders a button', () => {
    const wrapper = shallow(<LoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
