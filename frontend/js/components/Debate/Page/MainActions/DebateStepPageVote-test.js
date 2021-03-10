// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageVote } from './DebateStepPageVote';
import { $refType } from '~/mocks';

const baseProps = {
  debateId: 'debate-123',
  step: {
    $refType,
    isAnonymousParticipationAllowed: false,
  },
  isAuthenticated: true,
  viewerHasArgument: false,
  onSuccess: jest.fn(),
};

const props = {
  basic: baseProps,
  notAuthenticated: {
    ...baseProps,
    isAuthenticated: false,
  },
  withViewerArgument: {
    ...baseProps,
    viewerHasArgument: true,
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

  it('should renders correctly with viewer argument', () => {
    const wrapper = shallow(<DebateStepPageVote {...props.withViewerArgument} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly with anonymous participation', () => {
    const wrapper = shallow(<DebateStepPageVote {...props.anonymousParticipationAllowed} />);
    expect(wrapper).toMatchSnapshot();
  });
});
