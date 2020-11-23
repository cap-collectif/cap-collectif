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
    currentStep: { id: 'stepId', votesRanking: false },
    user: { id: 'id1' },
    isAuthenticated: true,
  };

  it('renders viewer has not voted', () => {
    const proposal = {
      $refType,
      id: 'proposal1',
      viewerHasVote: false,
      viewerVote: null,
      form: {
        objectType: 'PROPOSAL',
      },
      project: {
        type: {
          title: 'global.consultation',
        },
      },
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
        ranking: null,
        $fragmentRefs,
      },
      form: {
        objectType: 'PROPOSAL',
      },
      project: {
        type: {
          title: 'global.consultation',
        },
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
        ranking: null,
        $fragmentRefs,
      },
      form: {
        objectType: 'PROPOSAL',
      },
      project: {
        type: {
          title: 'global.consultation',
        },
      },
    };
    const wrapper = shallow(<ProposalVoteButton isHovering proposal={proposal} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders viewer has voted and hovering with ranking', () => {
    const proposal = {
      $refType,
      id: 'proposal1',
      viewerHasVote: true,
      viewerVote: {
        id: 'vote1',
        ranking: 0,
        $fragmentRefs,
      },
      form: {
        objectType: 'PROPOSAL',
      },
      project: {
        type: {
          title: 'global.consultation',
        },
      },
    };
    const wrapper = shallow(<ProposalVoteButton isHovering proposal={proposal} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
