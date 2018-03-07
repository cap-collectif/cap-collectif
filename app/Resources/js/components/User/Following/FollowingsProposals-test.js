/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { FollowingsProposals } from './FollowingsProposals';

describe('<FollowingsProposals />', () => {
  // $FlowFixMe $refType
  const viewer = {
    followingProposals: [],
  };

  it('should render following proposal open', () => {
    const wrapper = shallow(<FollowingsProposals viewer={viewer} />);
    wrapper.setState({ open: true });
    expect(wrapper).toMatchSnapshot();
  });
  it('should render following proposal close', () => {
    const wrapper = shallow(<FollowingsProposals viewer={viewer} />);
    wrapper.setState({ open: false });
    expect(wrapper).toMatchSnapshot();
  });
});
