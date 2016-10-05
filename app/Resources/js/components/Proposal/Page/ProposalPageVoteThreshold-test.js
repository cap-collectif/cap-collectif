/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import ProposalPageVoteThreshold from './ProposalPageVoteThreshold';

describe('<ProposalPageVoteThreshold />', () => {
  const proposal = {
    votesCount: 20,
  };

  const stepWithVoteThreshold = {
    voteThreshold: 100,
  };

  const stepWithVoteThresholdReached = {
    voteThreshold: 20,
  };

  it('should render proposal page vote threshold', () => {
    const wrapper = shallow(<ProposalPageVoteThreshold proposal={proposal} step={stepWithVoteThreshold} {...IntlData} />);
    const mainDiv = wrapper.find('div.proposal__page__vote_threshold');
    expect(mainDiv).to.have.length(1);
    const secondDiv = mainDiv.find('div.proposal__infos');
    expect(secondDiv).to.have.length(1);

    expect(secondDiv.find('h5').text()).to.equals('Soutenez cette proposition');
    expect(secondDiv.find('p.proposal__page__vote_threshold__votes')).to.have.length(1);
    expect(secondDiv.find('p.proposal__page__vote_threshold__votes').children()).to.have.length(3);
  });

  it('should render proposal page vote threshold reached', () => {
    const wrapper = shallow(<ProposalPageVoteThreshold proposal={proposal} step={stepWithVoteThresholdReached} {...IntlData} />);
    const mainDiv = wrapper.find('div.proposal__page__vote_threshold');
    expect(mainDiv).to.have.length(1);
    const secondDiv = mainDiv.find('div.proposal__infos');
    expect(secondDiv).to.have.length(1);

    expect(secondDiv.find('h5').text()).to.equals('Objectif atteint');
    expect(secondDiv.find('p.proposal__page__vote_threshold__votes')).to.have.length(1);
    expect(secondDiv.find('p.proposal__page__vote_threshold__votes').children()).to.have.length(3);
  });
});
