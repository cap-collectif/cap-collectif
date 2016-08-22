/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
      </VisibilityBox>
    );
    expect(wrapper.html()).to.equal('<div class="foo"></div>');
  });

  it('renders children if user is logged', () => {
    const wrapper = shallow(
      <VisibilityBox enabled user={{}} {...props}>
        <div className="foo" />
      </VisibilityBox>
    );
    expect(wrapper.find('.foo').html()).to.equal('<div class="foo"></div>');
    expect(wrapper.find('#privateInfo')).to.have.length(1);
    expect(wrapper.find('#privateInfo').text().trim()).to.be.eql(IntlData.messages.proposal.private.message);
  });

  it('renders jumbotron if user is not logged', () => {
    const wrapper = shallow(
      <VisibilityBox enabled user={null} {...props}>
        <div className="foo" />
      </VisibilityBox>
    );
    expect(wrapper.find('Jumbotron')).to.have.length(1);
    expect(wrapper.children().find('LoginButton')).to.have.length(1);
  });
});
