// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { LoginButton } from './LoginButton';
import { intlMock } from '../../../mocks';

describe('<LoginButton />', () => {
  const props = {
    className: 'btn-darkest-gray navbar-btn btn--connection',
    loginWithMonCompteParis: false,
    openLoginModal: jest.fn(),
    intl: intlMock,
  };

  it('renders a button', () => {
    const wrapper = shallow(<LoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
