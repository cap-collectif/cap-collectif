// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageVoteThreshold } from './ProposalPageVoteThreshold';
import { $refType } from '../../../mocks';

describe('<ProposalPageVoteThreshold />', () => {
  const proposal = {
    $refType,
    id: '1',
    votes: {
      totalCount: 30,
    },
  };

  const stepWithVoteThreshold = {
    $refType,
    id: '42',
    voteThreshold: 100,
  };

  const stepWithVoteThresholdReached = {
    $refType,
    id: '42',
    voteThreshold: 20,
  };

  it('should render proposal page vote threshold', () => {
    const wrapper = shallow(
      <ProposalPageVoteThreshold proposal={proposal} step={stepWithVoteThreshold} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render proposal page vote threshold reached', () => {
    const wrapper = shallow(
      <ProposalPageVoteThreshold proposal={proposal} step={stepWithVoteThresholdReached} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
