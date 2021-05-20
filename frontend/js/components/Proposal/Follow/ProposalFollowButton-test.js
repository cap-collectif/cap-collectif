// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFollowButton } from './ProposalFollowButton';
import { $refType } from '~/mocks';

describe('<ProposalFollowButton />', () => {
  const proposalViewIsFollowing = {
    $refType,
    id: 'proposal1',
    viewerIsFollowing: true,
    viewerFollowingConfiguration: 'MINIMAL',
  };
  const proposalViewIsNotFollowing = {
    $refType,
    id: 'proposal1',
    viewerIsFollowing: false,
    viewerFollowingConfiguration: null,
  };

  it('should render a button to unfollow a proposal when viewer is following.', () => {
    const wrapper = shallow(
      <ProposalFollowButton proposal={proposalViewIsFollowing} isAuthenticated />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a button to follow a proposal when viewer is not following.', () => {
    const wrapper = shallow(
      <ProposalFollowButton proposal={proposalViewIsNotFollowing} isAuthenticated />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when not authenticated', () => {
    const wrapper = shallow(<ProposalFollowButton proposal={null} isAuthenticated={false} />);
    expect(wrapper).toMatchSnapshot();
  });
});
