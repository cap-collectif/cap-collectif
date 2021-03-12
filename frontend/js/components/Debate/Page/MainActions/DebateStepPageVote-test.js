// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageVote } from './DebateStepPageVote';
import { $refType } from '~/mocks';

const baseProps = {
  step: {
    $refType,
    isAnonymousParticipationAllowed: false,
    debate: {
      id: 'debate-123',
      yesVotes: {
        totalCount: 12,
      },
      votes: {
        totalCount: 20,
      },
    },
  },
  isEmailConfirmed: true,
  isAuthenticated: true,
  setVoteState: jest.fn(),
};

const props = {
  basic: baseProps,
  notAuthenticated: {
    ...baseProps,
    isAuthenticated: false,
    isEmailConfirmed: false,
  },
  withEmailNotConfirmed: {
    ...baseProps,
    isEmailConfirmed: false,
  },
  anonymousParticipationAllowed: {
    ...baseProps,
    step: {
      ...baseProps.step,
      isAnonymousParticipationAllowed: true,
    },
  },
};

describe('<DebateStepPageVote/>', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<DebateStepPageVote {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when not authenticated', () => {
    const wrapper = shallow(<DebateStepPageVote {...props.notAuthenticated} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly with email not confirmed argument', () => {
    const wrapper = shallow(<DebateStepPageVote {...props.withEmailNotConfirmed} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly with anonymous participation', () => {
    const wrapper = shallow(<DebateStepPageVote {...props.anonymousParticipationAllowed} />);
    expect(wrapper).toMatchSnapshot();
  });
});
