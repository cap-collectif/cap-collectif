// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPreviewFooter } from './ProposalPreviewFooter';
import { $refType } from '../../../mocks';

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
      isProposalForm: true,
    },
    comments: { totalCount: 3 },
    allVotesOnStep: {
      totalCount: 42,
      totalPointsCount: 192,
    },
  };

  const proposalNotCommentable = {
    ...proposal,
    form: {
      commentable: false,
      isProposalForm: true,
    },
  };

  it('should render a footer with votes and comments counters', () => {
    const wrapper = shallow(
      <ProposalPreviewFooter step={stepWithVoteActive} proposal={proposal} />,
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
});
