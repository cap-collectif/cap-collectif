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
  };

  const stepWithVoteDisabled = {
    $refType,
    voteType: 'DISABLED',
  };

  const proposal = {
    $refType,
    id: '1',
    form: {
      commentable: true,
    },
    commentsCount: 3,
    allVotesOnStep: {
      totalCount: 42,
    },
  };

  const proposalNotCommentable = {
    ...proposal,
    form: {
      commentable: false,
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
