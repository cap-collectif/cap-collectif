/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { VoteHeaderTab } from './VoteHeaderTab';
import { $refType } from '~/mocks';

const baseProps = {
  debate: {
    id: 'debate123',
    $refType,
    debateVotesPublished: {
      totalCount: 2,
    },
    debateVotesWaiting: {
      totalCount: 2,
    },
    debateVotesFor: {
      totalCount: 2,
    },
    debateVotesAgainst: {
      totalCount: 2,
    },
  },
  debateStep: {
    $refType,
    timeRange: {
      hasEnded: false,
    },
  },
};

const props = {
  basic: baseProps,
  noVote: {
    ...baseProps,
    debate: {
      ...baseProps.debate,
      debateVotesPublished: {
        totalCount: 0,
      },
      debateVotesWaiting: {
        totalCount: 0,
      },
      debateVotesFor: {
        totalCount: 0,
      },
      debateVotesAgainst: {
        totalCount: 0,
      },
    },
  },
  stepClosed: {
    ...baseProps,
    debateStep: {
      ...baseProps.debateStep,
      timeRange: {
        hasEnded: true,
      },
    },
  },
};

describe('<VoteHeaderTab />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<VoteHeaderTab {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no vote', () => {
    const wrapper = shallow(<VoteHeaderTab {...props.noVote} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when step closed', () => {
    const wrapper = shallow(<VoteHeaderTab {...props.stepClosed} />);
    expect(wrapper).toMatchSnapshot();
  });
});
