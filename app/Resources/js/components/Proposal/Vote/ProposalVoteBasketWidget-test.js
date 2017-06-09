/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalVoteBasketWidget } from './ProposalVoteBasketWidget';
import IntlData from '../../../translations/FR';

describe('<ProposalVoteBasketWidget />', () => {
  const simpleWithoutLimitProps = {
    projectId: '1',
    votableSteps: [
      {
        id: '1',
        voteType: 1,
        budget: null,
      },
    ],
    votesPageUrl: 'http//capco.dev/votes',
    userVotesCountByStepId: { '1': 12 },
    creditsLeftByStepId: {},
    image: 'http://capco.dev/images.png',
    ...IntlData,
  };

  const simpleWithLimitProps = {
    projectId: '1',
    votableSteps: [
      {
        id: '1',
        voteType: 1,
        budget: null,
        votesLimit: 2,
      },
    ],
    votesPageUrl: 'http//capco.dev/votes',
    userVotesCountByStepId: { '1': 1 },
    creditsLeftByStepId: {},
    image: 'http://capco.dev/images.png',
    ...IntlData,
  };

  const budgetProps = {
    projectId: '1',
    votableSteps: [
      {
        id: '1',
        voteType: 1,
        budget: 350000,
      },
    ],
    votesPageUrl: 'http//capco.dev/votes',
    userVotesCountByStepId: { '1': 12 },
    creditsLeftByStepId: { '1': 120000 },
    image: 'http://capco.dev/images.png',
    ...IntlData,
  };

  it('should render a vote widget for a simple vote without limit', () => {
    const wrapper = shallow(
      <ProposalVoteBasketWidget {...simpleWithoutLimitProps} />,
    );
    wrapper.setState({ selectedStepId: '1' });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a vote widget for a simple vote with limit', () => {
    const wrapper = shallow(
      <ProposalVoteBasketWidget {...simpleWithLimitProps} />,
    );
    wrapper.setState({ selectedStepId: '1' });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a vote widget for a budget vote', () => {
    const wrapper = shallow(<ProposalVoteBasketWidget {...budgetProps} />);
    wrapper.setState({ selectedStepId: '1' });
    expect(wrapper).toMatchSnapshot();
  });
});
