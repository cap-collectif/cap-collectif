/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import ProposalPreviewFooter from './ProposalPreviewFooter';
import IntlData from '../../../translations/FR';

describe('<ProposalPreviewFooter />', () => {

  const proposal = {};

  const props = {
    proposal: proposal,
    votesDelta: 1,
    ...IntlData,
  };

  it('should render a footer with comment counter', () => {
    const wrapper = shallow(<ProposalPreviewFooter {...props} />);
    expect(wrapper.find('div.proposal__footer')).to.have.length(1);
    expect(wrapper.find('div.proposal__counters')).to.have.length(1);
    expect(wrapper.find('div.proposal__counter')).to.have.length(1);
    expect(wrapper.find('div.proposal__counter--comments')).to.have.length(1);
    expect(wrapper.find('div.proposal__counter--votes')).to.have.length(0);
  });

  it('should render a footer with comment and votes counters when specified', () => {
    const wrapper = shallow(<ProposalPreviewFooter {...props} showVotes={true} />);
    expect(wrapper.find('div.proposal__footer')).to.have.length(1);
    expect(wrapper.find('div.proposal__counters')).to.have.length(1);
    expect(wrapper.find('div.proposal__counter')).to.have.length(2);
    expect(wrapper.find('div.proposal__counter--comments')).to.have.length(1);
    expect(wrapper.find('div.proposal__counter--votes')).to.have.length(1);
  });
});
