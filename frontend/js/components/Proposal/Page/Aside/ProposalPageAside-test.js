/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageAside } from './ProposalPageAside';
import { $refType, $fragmentRefs } from '~/mocks';
import { disableFeatureFlags, enableFeatureFlags } from '~/testUtils';

const proposal = {
  $refType,
  $fragmentRefs,
  currentVotableStep: {
    voteType: 'SIMPLE',
    votesRanking: true,
    canDisplayBallot: true,
    $fragmentRefs,
  },
  tipsmeeeId: null,
  isProposalUsingAnySocialNetworks: true,
  viewerDidAuthor: true,
  form: {
    isUsingAnySocialNetworks: true,
    usingCategories: true,
    usingThemes: false,
    usingTipsmeee: false,
    step: {
      state: 'CLOSED',
    },
  },
};

const proposalWithSecretBallot = {
  ...proposal,
  currentVotableStep: {
    voteType: 'SIMPLE',
    votesRanking: true,
    canDisplayBallot: false,
    $fragmentRefs,
  },
};

const props = {
  ...proposal,
  hasVotableStep: false,
  isAuthenticated: false,
  opinionCanBeFollowed: false,
  isAnalysing: false,
};

describe('<ProposalPageAside />', () => {
  afterEach(() => {
    disableFeatureFlags();
  });

  it('should render correctly', () => {
    const wrapper = shallow(<ProposalPageAside {...props} proposal={proposal} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with votableStep', () => {
    const wrapper = shallow(
      <ProposalPageAside proposal={proposal} {...props} opinionCanBeFollowed hasVotableStep />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should not render correctly with votableStep', () => {
    const wrapper = shallow(
      <ProposalPageAside
        proposal={proposalWithSecretBallot}
        {...props}
        opinionCanBeFollowed
        hasVotableStep
        isAuthenticated
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with analysis', () => {
    const wrapper = shallow(
      <ProposalPageAside
        proposal={proposal}
        {...props}
        opinionCanBeFollowed
        hasVotableStep
        isAnalysing
        isAuthenticated
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with tipsmeee', () => {
    enableFeatureFlags(['unstable__tipsmeee']);

    const wrapper = shallow(
      <ProposalPageAside
        proposal={{
          ...proposal,
          form: {
            isUsingAnySocialNetworks: true,
            usingCategories: true,
            usingThemes: true,
            usingTipsmeee: true,
            step: {
              state: 'OPENED',
            },
          },
          tipsmeeeId: 'aTipsmeCode',
        }}
        {...props}
        opinionCanBeFollowed
        hasVotableStep
        isAnalysing
        isAuthenticated
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
