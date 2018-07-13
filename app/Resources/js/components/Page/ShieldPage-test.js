// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ShieldPage } from './ShieldPage';

describe('<ShieldPage />', () => {
  const props = {
    onSubmit: jest.fn(),
    submitting: false,
    chartBody: 'Super charte !!',
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
