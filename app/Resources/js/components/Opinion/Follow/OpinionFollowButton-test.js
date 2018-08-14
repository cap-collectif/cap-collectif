// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { $refType } from '../../../mocks';
import { OpinionFollowButton } from './OpinionFollowButton';

describe('<OpinionFollowButton />', () => {
  const opinionViewIsFollowing = {
    id: 'opinion1',
    viewerIsFollowing: true,
    viewerFollowingConfiguration: 'MINIMAL',
    $refType,
  };
  const opinionViewIsNotFollowing = {
    id: 'opinion1',
    viewerIsFollowing: false,
    viewerFollowingConfiguration: null,
    $refType,
  };

  const opinionViewIsNotConnected = {
    id: 'opinion1',
    viewerIsFollowing: false,
    viewerFollowingConfiguration: null,
    $refType,
  };

  const props = {
    className: '',
    referer: 'http://capco.test',
    $refType,
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
    const wrapper = shallow(<OpinionFollowButton opinion={opinionViewIsNotConnected} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
