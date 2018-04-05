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
  };
  // $FlowFixMe $refType
  const proposalViewIsNotFollowing = {
    id: 'proposal1',
    viewerIsFollowing: false,
  };
  // $FlowFixMe $refType
  const props = {
    className: '',
    referer: 'http://capco.test',
    oldProposal: {},
  };

  it('should render a button to follow a proposal', () => {
    const wrapper = shallow(
      <ProposalFollowButton proposal={proposalViewIsNotFollowing} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a button to unfollow a proposal', () => {
    const wrapper = shallow(<ProposalFollowButton proposal={proposalViewIsFollowing} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
