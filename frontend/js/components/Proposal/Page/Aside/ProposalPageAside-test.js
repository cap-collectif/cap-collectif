/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageAside } from './ProposalPageAside';
import { $refType, $fragmentRefs } from '~/mocks';
import { features } from '~/redux/modules/default';

const proposal = {
  $refType,
  $fragmentRefs,
  currentVotableStep: {
    voteType: 'SIMPLE',
    votesRanking: true,
    $fragmentRefs,
  },
  tipsmeeeId: null,
  isUsingAnySocialNetworks: true,
  form: {
    usingCategories: true,
    usingThemes: false,
    usingTipsmeee: false,
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
  it('should render correctly', () => {
    const wrapper = shallow(
      <ProposalPageAside {...props} proposal={proposal} features={{ ...features }} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with votableStep', () => {
    const wrapper = shallow(
      <ProposalPageAside
        proposal={proposal}
        {...props}
        opinionCanBeFollowed
        hasVotableStep
        isAuthenticated
        features={{ ...features }}
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
        features={{ ...features }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with tipsmeee', () => {
    const wrapper = shallow(
      <ProposalPageAside
        proposal={{
          ...proposal,
          form: {
            usingCategories: true,
            usingThemes: true,
            usingTipsmeee: true,
          },
          tipsmeeeId: 'aTipsmeCode',
        }}
        {...props}
        opinionCanBeFollowed
        hasVotableStep
        isAnalysing
        isAuthenticated
        features={{ ...features, unstable__tipsmeee: true }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
