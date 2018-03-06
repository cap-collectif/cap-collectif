/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { Tab } from 'react-bootstrap';
import { ProposalPage } from './ProposalPage';
import { features } from '../../../redux/modules/default';
import { VOTE_TYPE_SIMPLE, VOTE_TYPE_DISABLED } from '../../../constants/ProposalConstants';

describe('<ProposalPage />', () => {
  const props = {
    form: {
      usingThemes: true,
      usingCategories: false
    },
    themes: [],
    districts: [],
    categories: [],
    features: {
      ...features,
      themes: true,
      districts: false
    },
    steps: [{ id: '1', voteType: VOTE_TYPE_DISABLED }, { id: '2', voteType: VOTE_TYPE_SIMPLE }],
    viewerCanSeeEvaluation: true
  };

  const proposalNoVotes = {
    id: 41,
    referer: 'http://capco.test',
    votableStepId: '2',
    votesCountByStepId: {
      '2': 0
    },
    commentsCount: 5,
    selections: [],
    votesByStepId: {
      selectionstep1: [],
      collectstep1: []
    },
    viewerCanSeeEvaluation: true
  };
  const proposalWithVotes = {
    id: 42,
    referer: 'http://capco.test',
    votableStepId: '2',
    votesCountByStepId: {
      '2': 5
    },
    selections: [],
    votesByStepId: {
      selectionstep1: [],
      collectstep1: []
    },
    viewerCanSeeEvaluation: true
  };

  const proposalWithoutVotableStep = {
    id: 42,
    referer: 'http://capco.test',
    votableStepId: null,
    votesCountByStepId: {},
    selections: [],
    votesByStepId: {
      selectionstep1: [],
      collectstep1: []
    },
    viewerCanSeeEvaluation: true
  };

  it('should render a proposal page', () => {
    const wrapper = shallow(<ProposalPage {...props} proposal={proposalNoVotes} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a proposal page with evaluation tab', () => {
    const wrapper = shallow(
      <ProposalPage {...props} proposal={{ ...proposalNoVotes, viewerCanSeeEvaluation: true }} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a vote tab and a vote modal if votable step is specified', () => {
    const wrapper = shallow(<ProposalPage {...props} proposal={proposalWithVotes} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render a vote modal if proposal has no votabledStep', () => {
    const wrapper = shallow(<ProposalPage {...props} proposal={proposalWithoutVotableStep} />);
    const tabContainer = wrapper.find(Tab.Container);
    const proposalVoteModal = tabContainer.find('Connect(ProposalVoteModal)');
    expect(proposalVoteModal).toHaveLength(0);
  });
});
