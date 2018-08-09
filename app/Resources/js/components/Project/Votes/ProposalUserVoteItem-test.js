// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalUserVoteItem } from './ProposalUserVoteItem';
import { $refType, $fragmentRefs, intlMock } from '../../../mocks';

describe('<ProposalUserVoteItem />', () => {
  const vote = {
    $refType,
    $fragmentRefs,
    published: true,
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

  const props = {
    intl: intlMock,
  };

  it('should render a vote item', () => {
    const wrapper = shallow(
      <ProposalUserVoteItem
        isVoteVisibilityPublic
        member="votes.1"
        {...props}
        step={step}
        vote={vote}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
