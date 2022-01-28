// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPreviewFooter } from './ProposalPreviewFooter';
import { $refType } from '../../../mocks';
import { enableFeatureFlags } from '~/testUtils';

describe('<ProposalPreviewFooter />', () => {
  const stepWithVoteActive = {
    $refType,
    voteType: 'SIMPLE',
    project: {
      type: {
        title: 'global.consultation',
      },
    },
    votesRanking: true,
    canDisplayBallot: true,
  };

  const stepWithVoteActiveButNotDisplayed = {
    $refType,
    voteType: 'SIMPLE',
    project: {
      type: {
        title: 'global.consultation',
      },
    },
    votesRanking: true,
    canDisplayBallot: false,
  };

  const stepWithVoteDisabled = {
    $refType,
    voteType: 'DISABLED',
    project: {
      type: {
        title: 'global.consultation',
      },
    },
    votesRanking: false,
    canDisplayBallot: false,
  };

  const proposal = {
    $refType,
    id: '1',
    form: {
      commentable: true,
      objectType: 'PROPOSAL',
      usingTipsmeee: false,
    },
    allComments: { totalCountWithAnswers: 13 },
    allVotesOnStep: {
      totalCount: 42,
      totalPointsCount: 192,
    },
    tipsMeeeDonation: null,
  };

  const proposalNotCommentable = {
    ...proposal,
    tipsMeeeDonation: null,
    form: {
      commentable: false,
      objectType: 'PROPOSAL',
      usingTipsmeee: false,
    },
  };

  const proposalWithDonations = {
    ...proposal,
    tipsMeeeDonation: {
      donationCount: 5,
      donationTotalCount: 15000,
    },
    form: {
      commentable: false,
      objectType: 'ESTABLISHMENT',
      usingTipsmeee: true,
    },
  };

  it('should render a footer with votes and comments counters', () => {
    const wrapper = shallow(
      <ProposalPreviewFooter step={stepWithVoteActive} proposal={proposal} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a footer without votes counter', () => {
    const wrapper = shallow(
      <ProposalPreviewFooter step={stepWithVoteActiveButNotDisplayed} proposal={proposal} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a footer with comments counters only', () => {
    const wrapper = shallow(
      <ProposalPreviewFooter step={stepWithVoteDisabled} proposal={proposal} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a footer with votes counters only', () => {
    const wrapper = shallow(
      <ProposalPreviewFooter step={stepWithVoteActive} proposal={proposalNotCommentable} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a footer without counters', () => {
    const wrapper = shallow(
      <ProposalPreviewFooter step={stepWithVoteDisabled} proposal={proposalNotCommentable} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a footer with donation infos', () => {
    enableFeatureFlags(['unstable__tipsmeee']);
    const wrapper = shallow(
      <ProposalPreviewFooter proposal={proposalWithDonations} step={stepWithVoteDisabled} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
