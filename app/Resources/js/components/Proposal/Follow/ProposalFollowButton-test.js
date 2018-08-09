// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFollowButton } from './ProposalFollowButton';

describe('<ProposalFollowButton />', () => {
  // $FlowFixMe $refType
  const proposalViewIsFollowing = {
    id: 'proposal1',
    viewerIsFollowing: true,
    followerConfiguration: {
      notifiedOf: 'DEFAULT',
    },
  };
  // $FlowFixMe $refType
  const proposalViewIsNotFollowing = {
    id: 'proposal1',
    viewerIsFollowing: false,
    followerConfiguration: null,
  };

  // $FlowFixMe $refType
  const proposalViewIsNotConnected = {
    id: 'proposal1',
    viewerIsFollowing: false,
    followerConfiguration: null,
  };
  // $FlowFixMe $refType
  const props = {
    className: '',
    referer: 'http://capco.test',
  };

  it('should render a button to follow a proposal', () => {
    const wrapper = shallow(
      <ProposalFollowButton proposal={proposalViewIsNotFollowing} isAuthenticated {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a button to unfollow a proposal', () => {
    const wrapper = shallow(
      <ProposalFollowButton proposal={proposalViewIsFollowing} isAuthenticated {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render a button to follow a proposal and user is not connected', () => {
    const wrapper = shallow(
      // $FlowFixMe $refType isAuthenticated false
      <ProposalFollowButton proposal={proposalViewIsNotConnected} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
