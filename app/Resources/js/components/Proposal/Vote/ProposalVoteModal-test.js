// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalVoteModal } from './ProposalVoteModal';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ProposalVoteModal />', () => {
  const proposal = {
    $refType,
    id: 'proposal1',
    viewerHasVote: false,
  };
  const step = {
    id: 'step1',
    votesRanking: false,
    votesHelpText: 'Help',
    requirements: {
      viewerMeetsTheRequirements: false,
      reason: 'We need to collect',
      totalCount: 3,
    },
    $refType,
    $fragmentRefs,
    viewerVotes: {
      $fragmentRefs,
      totalCount: 0,
      edges: [],
    },
  };

  it('should render correctly', () => {
    const wrapper = shallow(
      <ProposalVoteModal
        showModal
        viewerIsConfirmedByEmail
        isSubmitting={false}
        invalid={false}
        proposal={proposal}
        step={step}
        dispatch={jest.fn()}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
