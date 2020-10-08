/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageTabs } from './ProposalPageTabs';
import { features } from '~/redux/modules/default';
import { $refType } from '~/mocks';

describe('<ProposalPageTabs />', () => {
  const proposal = {
    $refType,
    id: '1',
    allFollowers: {
      totalCount: 169,
    },
    currentVotableStep: null,
    votableSteps: [],
    news: {
      totalCount: 1,
      edges: [{ node: { id: 'news1', title: 'Titre' } }],
    },
    project: {
      opinionCanBeFollowed: true,
      type: {
        title: 'global.consultation',
      },
    },
    form: {
      usingThemes: true,
      usingCategories: true,
      isProposalForm: true,
    },
  };

  const props = {
    votesCount: 5,
    tabKey: 'content',
    categories: [],
    steps: [
      {
        title: 'title',
        id: 'step1',
      },
    ],
    step: {
      id: 'stepid',
      $refType,
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
        edges: [],
      },
    };
    const wrapper = shallow(<ProposalPageTabs proposal={proposalWithoutBlogTab} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
