// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ShieldPage } from './ShieldPage';
import IntlData from '../../translations/FR';

describe('<ShieldPage />', () => {
  const props = {
    ...IntlData,
    onSubmit: jest.fn(),
    submitting: false,
  };

  it('renders with registration enabled', () => {
    const wrapper = shallow(<ShieldPage showRegistration {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with registration disabled', () => {
    const wrapper = shallow(<ShieldPage showRegistration={false} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
