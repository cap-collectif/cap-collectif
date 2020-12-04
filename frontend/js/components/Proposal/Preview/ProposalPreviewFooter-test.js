// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPreviewFooter } from './ProposalPreviewFooter';
import { $refType } from '../../../mocks';
import { features } from '../../../redux/modules/default';

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
  };

  const proposal = {
    $refType,
    id: '1',
    form: {
      commentable: true,
      objectType: 'PROPOSAL',
      usingTipsmeee: false,
    },
    comments: { totalCount: 3 },
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
      <ProposalPreviewFooter step={stepWithVoteActive} proposal={proposal} features={features} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a footer with comments counters only', () => {
    const wrapper = shallow(
      <ProposalPreviewFooter step={stepWithVoteDisabled} proposal={proposal} features={features} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a footer with votes counters only', () => {
    const wrapper = shallow(
      <ProposalPreviewFooter
        step={stepWithVoteActive}
        proposal={proposalNotCommentable}
        features={features}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a footer without counters', () => {
    const wrapper = shallow(
      <ProposalPreviewFooter
        step={stepWithVoteDisabled}
        proposal={proposalNotCommentable}
        features={features}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a footer with donation infos', () => {
    const wrapper = shallow(
      <ProposalPreviewFooter
        proposal={proposalWithDonations}
        step={stepWithVoteDisabled}
        features={{ ...features, unstable__tipsmeee: true }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
