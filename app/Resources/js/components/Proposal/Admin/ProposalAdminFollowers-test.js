// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminFollowers } from './ProposalAdminFollowers';
import { intlMock } from '../../../mocks';

describe('<ProposalAdminFollowers />', () => {
  // $FlowFixMe $refType
  const proposalWithUsers = {
    id: 'proposal1',
    totalCount: 3,
    followerConnection: {
      totalCount: 3,
    },
  };
  // $FlowFixMe $refType
  const proposalWithoutUsers = {
    id: 'proposal1',
    totalCount: 0,
    followerConnection: {
      totalCount: 0,
    },
  };
  const props = {
    intl: intlMock,
  };

  it('should render a proposal page follower with 3 users', () => {
    const wrapper = shallow(<ProposalAdminFollowers proposal={proposalWithUsers} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a proposal page follower without users', () => {
    const wrapper = shallow(<ProposalAdminFollowers proposal={proposalWithoutUsers} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
