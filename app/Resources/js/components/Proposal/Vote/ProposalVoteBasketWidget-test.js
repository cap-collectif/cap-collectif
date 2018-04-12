// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalVoteBasketWidget } from './ProposalVoteBasketWidget';
import { relayRefetchMock as relay, mockRefType as $refType } from '../../../mocks';

describe('<ProposalVoteBasketWidget />', () => {
  const simpleWithoutLimitProps = {
    project: {
      id: '1',
      $refType,
      votableSteps: [
        {
          id: '1',
          voteType: 'SIMPLE',
          budget: null,
        },
      ],
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
    project: {
      id: '1',
      $refType,
      votableSteps: [
        {
          id: '1',
          voteType: 'SIMPLE',
          budget: null,
          votesLimit: 2,
        },
      ],
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
    project: {
      id: '1',
      $refType,
      votableSteps: [
        {
          id: '1',
          voteType: 'SIMPLE',
          budget: 350000,
        },
      ],
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
    wrapper.setState({ selectedStepId: '1' });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a vote widget for a simple vote with limit', () => {
    const wrapper = shallow(<ProposalVoteBasketWidget {...simpleWithLimitProps} />);
    wrapper.setState({ selectedStepId: '1' });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a vote widget for a budget vote', () => {
    const wrapper = shallow(<ProposalVoteBasketWidget {...budgetProps} />);
    wrapper.setState({ selectedStepId: '1' });
    expect(wrapper).toMatchSnapshot();
  });
});
