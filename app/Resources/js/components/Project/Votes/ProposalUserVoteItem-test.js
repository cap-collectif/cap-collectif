// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalUserVoteItem } from './ProposalUserVoteItem';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ProposalUserVoteItem />', () => {
  const vote = {
    $refType,
    createdAt: '2015-01-01 00:00:00',
    proposal: {
      id: '1',
      $fragmentRefs,
      title: 'proposal',
      show_url: 'http://capco.test/proposal',
    },
  };
  const step = {
    id: '1',
    open: true,
    votesRanking: false,
    voteType: 'SIMPLE',
    $refType,
  };

  it('should render a vote item', () => {
    const wrapper = shallow(<ProposalUserVoteItem member="votes.1" step={step} vote={vote} />);
    expect(wrapper).toMatchSnapshot();
  });
});
