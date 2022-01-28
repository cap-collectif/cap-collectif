/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPage } from './ProposalPage';
import { disableFeatureFlags } from '~/testUtils';

describe('<ProposalPage />', () => {
  const props = {
    proposalId: '41',
    proposalTitle: 'Titre',
    currentVotableStepId: 'stepid',
    opinionCanBeFollowed: false,
    hasVotableStep: false,
    isAuthenticated: false,
    image: '/lepetitcochontirelirechelou.jpg',
    showVotesWidget: true,
    votesPageUrl: '/votes',
  };

  afterEach(() => {
    disableFeatureFlags();
  });

  it('should render a proposal page', () => {
    const wrapper = shallow(<ProposalPage currentVotableStepId={null} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
