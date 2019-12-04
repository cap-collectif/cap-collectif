// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { LoginForm } from './LoginForm';

describe('<LoginForm />', () => {
  it('renders a form with inputs and connection restricted', () => {
    const wrapper = shallow(<LoginForm restrictConnection submitting={false} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a form with inputs and connection not restricted', () => {
    const wrapper = shallow(<LoginForm restrictConnection={false} submitting />);
    expect(wrapper).toMatchSnapshot();
  });
});
