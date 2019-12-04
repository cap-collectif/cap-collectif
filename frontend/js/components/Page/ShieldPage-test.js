// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ShieldPage } from './ShieldPage';

describe('<ShieldPage />', () => {
  const props = {
    onSubmit: jest.fn(),
    submitting: false,
    loginWithOpenId: false,
    byPassAuth: false,
  };

  it('renders with registration enabled', () => {
    const wrapper = shallow(<ShieldPage showRegistration {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with registration disabled', () => {
    const wrapper = shallow(<ShieldPage showRegistration={false} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with registration disabled and classical auth by pass enabled', () => {
    const wrapper = shallow(
      <ShieldPage
        showRegistration={false}
        byPassAuth
        loginWithOpenId
        submitting={false}
        onSubmit={jest.fn()}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
