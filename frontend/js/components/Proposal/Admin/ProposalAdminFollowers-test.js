// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminFollowers } from './ProposalAdminFollowers';
import { intlMock, $fragmentRefs, $refType } from '../../../mocks';

describe('<ProposalAdminFollowers />', () => {
  const proposalWithUsers = {
    $refType,
    $fragmentRefs,
    id: 'proposal1',
    allFollowers: {
      totalCount: 3,
    },
  };

  const proposalWithoutUsers = {
    $refType,
    $fragmentRefs,
    id: 'proposal1',
    allFollowers: {
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
