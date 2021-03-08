// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageAbsoluteVoteAndShare } from './DebateStepPageAbsoluteVoteAndShare';
import { $refType, $fragmentRefs } from '~/mocks';

const baseProps = {
  body: 'blabla le body',
  isAuthenticated: true,
  viewerIsConfirmed: true,
  step: {
    $refType,
    url: 'step/123',
    debate: {
      $fragmentRefs,
      id: 'debate1',
      viewerHasArgument: undefined,
    },
  },
  isMobile: false,
  showArgumentForm: true,
  setVoteState: jest.fn(),
  setShowArgumentForm: jest.fn(),
  voteState: 'NONE',
};

const props = {
  basic: baseProps,
  onMobile: {
    ...baseProps,
    isMobile: true,
  },
  whenVoted: {
    ...baseProps,
    voteState: 'VOTED',
  },
  whenVotedMobile: {
    ...baseProps,
    voteState: 'VOTED',
    isMobile: true,
  },
  whenArgumented: {
    ...baseProps,
    voteState: 'ARGUMENTED',
    step: {
      ...baseProps.step,
      debate: {
        ...baseProps.step.debate,
        viewerHasArgument: true,
      },
    },
  },
  whenArgumentedMobile: {
    ...baseProps,
    voteState: 'ARGUMENTED',
    isMobile: true,
    step: {
      ...baseProps.step,
      debate: {
        ...baseProps.step.debate,
        viewerHasArgument: true,
      },
    },
  },
};

describe('<DebateStepPageAbsoluteVoteAndShare />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<DebateStepPageAbsoluteVoteAndShare {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly on mobile', () => {
    const wrapper = shallow(<DebateStepPageAbsoluteVoteAndShare {...props.onMobile} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when voted', () => {
    const wrapper = shallow(<DebateStepPageAbsoluteVoteAndShare {...props.whenVoted} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when voted on mobile', () => {
    const wrapper = shallow(<DebateStepPageAbsoluteVoteAndShare {...props.whenVotedMobile} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when argumented', () => {
    const wrapper = shallow(<DebateStepPageAbsoluteVoteAndShare {...props.whenArgumented} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when argumented on mobile', () => {
    const wrapper = shallow(<DebateStepPageAbsoluteVoteAndShare {...props.whenArgumentedMobile} />);
    expect(wrapper).toMatchSnapshot();
  });
});
