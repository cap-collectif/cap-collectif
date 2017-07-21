// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { VisibilityBox } from './VisibilityBox';
import IntlData from '../../translations/FR';

describe('<VisibilityBox />', () => {
  const props = {
    ...IntlData,
  };

  it('renders children if not enabled', () => {
    const wrapper = shallow(
      <VisibilityBox {...props}>
        <div className="foo" />
      </VisibilityBox>,
    );
    expect(wrapper.html()).toEqual('<div class="foo"></div>');
  });

  it('renders children if user is logged', () => {
    const wrapper = shallow(
      <VisibilityBox enabled user={{}} {...props}>
        <div className="foo" />
      </VisibilityBox>,
    );
    expect(wrapper.find('.foo').html()).toEqual('<div class="foo"></div>');
    expect(wrapper.find('#privateInfo')).toHaveLength(1);
    expect(wrapper.find('#privateInfo').text().trim()).toEqual(IntlData.messages.proposal.private.message);
  });

  it('renders jumbotron if user is not logged', () => {
    const wrapper = shallow(
      <VisibilityBox enabled user={null} {...props}>
        <div className="foo" />
      </VisibilityBox>,
    );
    expect(wrapper.find('Jumbotron')).toHaveLength(1);
    expect(wrapper.children().find('Connect(LoginButton)')).toHaveLength(1);
  });
});
