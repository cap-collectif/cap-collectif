// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalVoteBasketWidget } from './ProposalVoteBasketWidget';
import { relayRefetchMock as relay, $refType } from '../../../mocks';
import { features } from '~/redux/modules/default';

describe('<ProposalVoteBasketWidget />', () => {
  const colorProps = {
    voteBarBackgroundColor: '#FFF',
    voteBarBorderColor: '#AAA',
    voteBarButtonBgColor: '#CCC',
    voteBarButtonTextColor: '#000',
    voteBarTextColor: '#333',
  };

  const simpleWithoutLimitProps = {
    features,
    ...colorProps,
    step: {
      $refType,
      id: '1',
      votesMin: null,
      viewerVotes: { totalCount: 5 },
      votesLimit: null,
      voteType: 'SIMPLE',
      budget: null,
      form: {
        isProposalForm: true,
      },
      project: {
        type: {
          title: 'global.consultation',
        },
      },
    },
    viewer: {
      id: '1',
      $refType,
      proposalVotes: {
        totalCount: 0,
        creditsLeft: null,
        creditsSpent: null,
      },
    },
    votesPageUrl: 'http//capco.dev/votes',
    image: 'http://capco.dev/images.png',
    relay,
  };

  const simpleWithLimitProps = {
    ...colorProps,
    features,
    step: {
      $refType,
      id: '1',
      votesMin: null,
      viewerVotes: { totalCount: 2 },
      voteType: 'SIMPLE',
      budget: null,
      votesLimit: 2,
      form: {
        isProposalForm: true,
      },
      project: {
        type: {
          title: 'global.consultation',
        },
      },
    },
    votesPageUrl: 'http//capco.dev/votes',
    viewer: {
      id: '1',
      $refType,
      proposalVotes: {
        totalCount: 1,
        creditsLeft: null,
        creditsSpent: null,
      },
    },
    image: 'http://capco.dev/images.png',
    relay,
    $refType,
  };

  const budgetProps = {
    ...colorProps,
    features,
    step: {
      $refType,
      id: '1',
      votesMin: null,
      viewerVotes: { totalCount: 1 },
      voteType: 'SIMPLE',
      budget: 350000,
      votesLimit: null,
      form: {
        isProposalForm: true,
      },
      project: {
        type: {
          title: 'global.consultation',
        },
      },
    },
    votesPageUrl: 'http//capco.dev/votes',
    viewer: {
      id: '1',
      $refType,
      proposalVotes: {
        totalCount: 12,
        creditsLeft: 120000,
        creditsSpent: null,
      },
    },
    image: 'http://capco.dev/images.png',
    relay,
  };

  const simpleWithLimitPropsInterpellation = {
    features,
    ...colorProps,
    step: {
      $refType,
      id: '1',
      voteType: 'SIMPLE',
      votesMin: null,
      budget: null,
      votesLimit: 2,
      viewerVotes: { totalCount: 0 },
      form: {
        isProposalForm: true,
      },
      project: {
        type: {
          title: 'project.types.interpellation',
        },
      },
    },
    votesPageUrl: 'http//capco.dev/votes',
    viewer: {
      id: '1',
      $refType,
      proposalVotes: {
        totalCount: 1,
        creditsLeft: null,
        creditsSpent: null,
      },
    },
    image: 'http://capco.dev/images.png',
    relay,
    $refType,
  };

  it('should render a vote widget for a simple vote without limit', () => {
    const wrapper = shallow(<ProposalVoteBasketWidget {...simpleWithoutLimitProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a vote widget for a simple vote with limit', () => {
    const wrapper = shallow(<ProposalVoteBasketWidget {...simpleWithLimitProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a vote widget for a budget vote', () => {
    const wrapper = shallow(<ProposalVoteBasketWidget {...budgetProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a vote widget for a simple support with limit', () => {
    const wrapper = shallow(<ProposalVoteBasketWidget {...simpleWithLimitPropsInterpellation} />);
    expect(wrapper).toMatchSnapshot();
  });
});
