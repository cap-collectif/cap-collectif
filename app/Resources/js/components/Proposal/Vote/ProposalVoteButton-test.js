// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalVoteButton } from './ProposalVoteButton';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ProposalVoteButton />', () => {
  const props = {
    dispatch: jest.fn(),
    id: 'buttonID',
    isDeleting: false,
    step: { id: 'stepId' },
    user: { id: 'id1' },
  };

  it('renders viewer has not voted', () => {
    const proposal = {
      $refType,
      id: 'proposal1',
      viewerHasVote: false,
      viewerVote: null,
    };
    const wrapper = shallow(<ProposalVoteButton proposal={proposal} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders viewer has voted', () => {
    const proposal = {
      $refType,
      id: 'proposal1',
      viewerHasVote: true,
      viewerVote: {
        id: 'vote1',
        $fragmentRefs,
      },
    };
    const wrapper = shallow(<ProposalVoteButton proposal={proposal} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders viewer has voted and hovering', () => {
    const proposal = {
      $refType,
      id: 'proposal1',
      viewerHasVote: true,
      viewerVote: {
        id: 'vote1',
        $fragmentRefs,
      },
    };
    const wrapper = shallow(<ProposalVoteButton isHovering proposal={proposal} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
