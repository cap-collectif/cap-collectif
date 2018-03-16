/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPreview } from './ProposalPreview';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';

describe('<ProposalPreview />', () => {
  const proposalVotable = {
    votableStepId: 'step2',
    category: {},
    author: {
      vip: true,
    },
    referer: 'http://capco.test',
    votesCountByStepId: {
      '2': 0,
    },
    commentsCount: 5,
    selections: [],
    votesByStepId: {
      selectionstep1: [],
      collectstep1: [],
    },
    viewerCanSeeEvaluation: true,
  };

  const proposalWithDifferentStepId = {
    votableStepId: 'step3',
    category: {},
    author: {
      vip: false,
    },
    referer: 'http://capco.test',
    votesCountByStepId: {
      '2': 0,
    },
    commentsCount: 5,
    selections: [],
    votesByStepId: {
      selectionstep1: [],
      collectstep1: [],
    },
    viewerCanSeeEvaluation: true,
  };

  const props = {
    className: '',
    referer: 'http://capco.test',
    showThemes: true,
    showComments: true,
    isAuthenticated: true,
  };

  const step2 = {
    id: 'step2',
    voteThreshold: 0,
    voteType: VOTE_TYPE_BUDGET,
  };

  const step3 = {
    id: 'step3',
    voteThreshold: 0,
    voteType: VOTE_TYPE_BUDGET,
  };

  it('should render a proposal preview votable', () => {
    const wrapper = shallow(
      <ProposalPreview
        proposal={proposalVotable}
        showThemes
        showComments
        step={step2}
        {...props}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a proposal preview with different step id and vip false', () => {
    const wrapper = shallow(
      <ProposalPreview
        proposal={proposalWithDifferentStepId}
        showThemes
        showComments
        step={step3}
        {...props}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
