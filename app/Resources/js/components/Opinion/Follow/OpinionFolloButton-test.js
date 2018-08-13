// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionFollowButton } from './OpinionFollowButton';

describe('<OpinionFollowButton />', () => {
  // $FlowFixMe $refType
  const opinionViewIsFollowing = {
    id: 'opinion1',
    viewerIsFollowing: true,
    viewerFollowingConfiguration: 'MINIMAL',
  };
  // $FlowFixMe $refType
  const opinionViewIsNotFollowing = {
    id: 'opinion1',
    viewerIsFollowing: false,
    viewerFollowingConfiguration: null,
  };

  // $FlowFixMe $refType
  const opinionViewIsNotConnected = {
    id: 'opinion1',
    viewerIsFollowing: false,
    viewerFollowingConfiguration: null,
  };
  // $FlowFixMe $refType
  const props = {
    className: '',
    referer: 'http://capco.test',
  };

  it('should render a button to follow a opinion', () => {
    const wrapper = shallow(
      <OpinionFollowButton opinion={opinionViewIsNotFollowing} isAuthenticated {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a button to unfollow a opinion', () => {
    const wrapper = shallow(
      <OpinionFollowButton opinion={opinionViewIsFollowing} isAuthenticated {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render a button to follow a opinion and user is not connected', () => {
    const wrapper = shallow(
      // $FlowFixMe $refType isAuthenticated false
      <OpinionFollowButton opinion={opinionViewIsNotConnected} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
