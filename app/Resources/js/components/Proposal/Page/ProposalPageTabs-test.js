/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageTabs } from './ProposalPageTabs';
import { features } from '../../../redux/modules/default';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ProposalPageTabs />', () => {
  const proposal = {
    $refType,
    $fragmentRefs,
    id: '1',
    followerConnection: {
      totalCount: 169,
    },
    currentVotableStep: null,
    votes: {
      totalCount: 1,
    },
    news: {
      totalCount: 1,
    },
    viewerCanSeeEvaluation: true,
  };

  const props = {
    form: {
      $refType,
      usingThemes: true,
      usingCategories: true,
    },
    oldProposal: {
      selections: [],
      votesByStepId: {
        selectionstep1: [],
        collectstep1: [],
      },
      votableStepId: 'selectionstep1',
      votesCountByStepId: {
        selectionstep1: 0,
        collectstep1: 0,
      },
      isDraft: false,
      viewerCanSeeEvaluation: true,
    },
    categories: [],
    steps: [
      {
        title: 'title',
        id: 'step1',
      },
    ],
    features: {
      ...features,
      districts: true,
      themes: true,
    },
  };

  it('should render Tabs with correct DOM structure', () => {
    const wrapper = shallow(<ProposalPageTabs proposal={proposal} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
