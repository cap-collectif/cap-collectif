/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPage } from './ProposalPage';

describe('<ProposalPage />', () => {
  const props = {
    proposalId: '41',
    proposalTitle: 'Titre',
    proposalRevisionsEnabled: false,
    currentVotableStepId: 'stepid',
    isAuthenticated: true,
    isTipsMeeeEnabled: false,
    opinionCanBeFollowed: false,
    hasVotableStep: false,
    image: '/lepetitcochontirelirechelou.jpg',
    showVotesWidget: true,
    votesPageUrl: '/votes',
  };

  it('should render a proposal page', () => {
    const wrapper = shallow(
      <ProposalPage isAuthenticated currentVotableStepId={null} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
