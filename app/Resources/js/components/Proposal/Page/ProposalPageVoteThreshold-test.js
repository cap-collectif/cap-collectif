/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import ProposalPageVoteThreshold from './ProposalPageVoteThreshold';

describe('<ProposalPageVoteThreshold />', () => {
  const proposal = {
    votesCountByStepId: {
      42: 30,
    },
  };

  const stepWithVoteThreshold = {
    id: 42,
    voteThreshold: 100,
  };

  const stepWithVoteThresholdReached = {
    id: 42,
    voteThreshold: 20,
  };

  it('should render proposal page vote threshold', () => {
    const wrapper = shallow(<ProposalPageVoteThreshold proposal={proposal} step={stepWithVoteThreshold} {...IntlData} />);
    const mainDiv = wrapper.find('div.proposal__page__vote_threshold');
    expect(mainDiv).toHaveLength(1);
    const secondDiv = mainDiv.find('div.proposal__infos');
    expect(secondDiv).toHaveLength(1);

    expect(secondDiv.find('h4').text()).toEqual('Soutenez cette proposition');
    expect(secondDiv.find('p.proposal__page__vote_threshold__votes')).toHaveLength(1);
    expect(secondDiv.find('p.proposal__page__vote_threshold__votes').children()).toHaveLength(3);
  });

  it('should render proposal page vote threshold reached', () => {
    const wrapper = shallow(<ProposalPageVoteThreshold proposal={proposal} step={stepWithVoteThresholdReached} {...IntlData} />);
    const mainDiv = wrapper.find('div.proposal__page__vote_threshold');
    expect(mainDiv).toHaveLength(1);
    const secondDiv = mainDiv.find('div.proposal__infos');
    expect(secondDiv).toHaveLength(1);

    expect(secondDiv.find('h4').text()).toEqual('Objectif atteint');
    expect(secondDiv.find('p.proposal__page__vote_threshold__votes')).toHaveLength(1);
    expect(secondDiv.find('p.proposal__page__vote_threshold__votes').children()).toHaveLength(3);
  });
});
