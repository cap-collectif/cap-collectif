/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import ProposalPreviewFooter from './ProposalPreviewFooter';
import IntlData from '../../../translations/FR';

describe('<ProposalPreviewFooter />', () => {
  const proposal = {
    comments_count: 3,
    votesCountByStepId: {
      1: 1,
      42: 5,
    },
  };

  const props = {
    proposal,
    votesDelta: 1,
    stepId: 1,
    ...IntlData,
  };

  it('should render a footer with comment counter', () => {
    const wrapper = shallow(<ProposalPreviewFooter {...props} />);
    const footer = wrapper.find('div.proposal__footer');
    expect(footer).to.have.length(1);

    const countersDiv = footer.find('div.proposal__counters');
    expect(countersDiv).to.have.length(1);
    expect(countersDiv.find('div.proposal__counter')).to.have.length(1);
    expect(countersDiv.find('div.proposal__counter--votes')).to.have.length(0);

    const commentsCounter = countersDiv.find('div.proposal__counter--comments');
    expect(commentsCounter).to.have.length(1);
    expect(commentsCounter.find('.proposal__counter__value').text()).to.equal('3');
  });

  it('should render a footer with comment and votes counters', () => {
    const wrapper = shallow(<ProposalPreviewFooter {...props} showVotes />);
    console.log(wrapper.debug());
    const footer = wrapper.find('div.proposal__footer');
    expect(footer).to.have.length(1);

    const countersDiv = footer.find('div.proposal__counters');
    expect(countersDiv).to.have.length(1);
    expect(countersDiv.find('div.proposal__counter')).to.have.length(2);
    const commentsCounter = countersDiv.find('div.proposal__counter--comments');
    expect(commentsCounter).to.have.length(1);
    expect(commentsCounter.find('.proposal__counter__value').text()).to.equal('3');
    const votesCounter = countersDiv.find('div.proposal__counter--votes');
    expect(votesCounter).to.have.length(1);
    expect(votesCounter.find('.proposal__counter__value').text()).to.equal(`${proposal.votesCount}`);
  });

  it('should render a footer with comment and votes counters when selection step is specified', () => {
    const wrapper = shallow(<ProposalPreviewFooter {...props} showVotes stepId={42} />);
    const footer = wrapper.find('div.proposal__footer');
    expect(footer).to.have.length(1);
    const countersDiv = footer.find('div.proposal__counters');
    expect(countersDiv).to.have.length(1);
    expect(countersDiv.find('div.proposal__counter')).to.have.length(2);
    const commentsCounter = countersDiv.find('div.proposal__counter--comments');
    expect(commentsCounter).to.have.length(1);
    expect(commentsCounter.find('.proposal__counter__value').text()).to.equal('3');
    const votesCounter = countersDiv.find('div.proposal__counter--votes');
    expect(votesCounter).to.have.length(1);
    const expectedVotes = proposal.votesCountByStepId[42] + props.votesDelta;
    expect(votesCounter.find('.proposal__counter__value').text()).to.equal(`${expectedVotes}`);
  });

  it('should render a footer with comment and votes counters when selection step votes are not specified', () => {
    const wrapper = shallow(<ProposalPreviewFooter {...props} showVotes stepId={43} />);
    const footer = wrapper.find('div.proposal__footer');
    expect(footer).to.have.length(1);
    const countersDiv = footer.find('div.proposal__counters');
    expect(countersDiv).to.have.length(1);
    expect(countersDiv.find('div.proposal__counter')).to.have.length(2);
    const commentsCounter = countersDiv.find('div.proposal__counter--comments');
    expect(commentsCounter).to.have.length(1);
    expect(commentsCounter.find('.proposal__counter__value').text()).to.equal('3');
    const votesCounter = countersDiv.find('div.proposal__counter--votes');
    expect(votesCounter).to.have.length(1);
    const expectedVotes = props.votesDelta;
    expect(votesCounter.find('.proposal__counter__value').text()).to.equal(`${expectedVotes}`);
  });
});
