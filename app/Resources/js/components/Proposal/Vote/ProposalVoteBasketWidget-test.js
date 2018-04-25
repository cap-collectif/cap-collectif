// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalVoteBasketWidget } from './ProposalVoteBasketWidget';
import { relayRefetchMock as relay, $refType } from '../../../mocks';

describe('<ProposalVoteBasketWidget />', () => {
  const simpleWithoutLimitProps = {
    step: {
      $refType,
      id: '1',
      title: 'step title',
      votesLimit: null,
      voteType: 'SIMPLE',
      budget: null,
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
    step: {
      $refType,
      id: '1',
      title: 'step title',
      voteType: 'SIMPLE',
      budget: null,
      votesLimit: 2,
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
    step: {
      $refType,
      id: '1',
      title: 'step title',
      voteType: 'SIMPLE',
      budget: 350000,
      votesLimit: null,
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
});
