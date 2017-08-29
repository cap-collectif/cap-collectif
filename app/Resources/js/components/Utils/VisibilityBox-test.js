// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { VisibilityBox } from './VisibilityBox';

describe('<VisibilityBox />', () => {
  const props = {};

  it('renders children if not enabled', () => {
    const wrapper = shallow(
      <VisibilityBox {...props}>
        <div className="foo" />
      </VisibilityBox>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders children if user is logged', () => {
    const wrapper = shallow(
      <VisibilityBox enabled user={{}} {...props}>
        <div className="foo" />
      </VisibilityBox>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders jumbotron if user is not logged', () => {
    const wrapper = shallow(
      <VisibilityBox enabled user={null} {...props}>
        <div className="foo" />
      </VisibilityBox>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
