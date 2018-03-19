/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageTabs } from './ProposalPageTabs';
import { features } from '../../../redux/modules/default';

describe('<ProposalPageTabs />', () => {
  // $FlowFixMe $refType
  const proposal = {
    followerConnection: {
      totalCount: 169,
    },
    postsCount: 1,
    viewerCanSeeEvaluation: true,
  };
  // $FlowFixMe $refType
  const props = {
    form: {
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
    votesCount: 150,
    isAuthenticated: true,
  };

  const isAuth = true;

  it('should render Tabs with correct DOM structure', () => {
    const wrapper = shallow(
      <ProposalPageTabs proposal={proposal} isAuthenticated={isAuth} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
