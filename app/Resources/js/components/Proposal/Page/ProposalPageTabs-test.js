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
    allFollowers: {
      totalCount: 169,
    },
    currentVotableStep: null,
    votableSteps: [],
    allVotes: {
      totalCount: 1,
    },
    news: {
      totalCount: 1,
    },
    viewerCanSeeEvaluation: true,
  };

  const props = {
    categories: [],
    steps: [
      {
        title: 'title',
        id: 'step1',
      },
    ],
    step: {
      $refType,
      $fragmentRefs,
      form: {
        usingThemes: true,
        usingCategories: true,
      },
    },
    features: {
      ...features,
      districts: true,
      themes: true,
    },
    viewer: null,
  };

  it('should render Tabs with correct DOM structure', () => {
    const wrapper = shallow(<ProposalPageTabs proposal={proposal} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render without blog tab', () => {
    const proposalWithoutBlogTab = {
      ...proposal,
      news: {
        totalCount: 0,
      },
    };
    const wrapper = shallow(<ProposalPageTabs proposal={proposalWithoutBlogTab} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
