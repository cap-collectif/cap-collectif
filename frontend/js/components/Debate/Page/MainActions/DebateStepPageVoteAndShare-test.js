// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageVoteAndShare } from './DebateStepPageVoteAndShare';
import { $refType, $fragmentRefs } from '~/mocks';

const baseProps = {
  url: 'step/123',
  step: {
    url: 'step/123',
    $refType,
    $fragmentRefs,
    isAnonymousParticipationAllowed: false,
    debate: {
      id: 'debate1',
      $fragmentRefs,
      votes: { totalCount: 5 },
      yesVotes: { totalCount: 4 },
      allArguments: {
        totalCount: 10,
      },
      argumentsFor: {
        totalCount: 5,
      },
      argumentsAgainst: {
        totalCount: 5,
      },
    },
  },
  isMobile: false,
  viewerIsConfirmedByEmail: true,
  isAuthenticated: true,
};

const props = {
  basic: baseProps,
  onMobile: {
    ...baseProps,
    isMobile: true,
  },
  viewerNotConfirmed: {
    ...baseProps,
    viewerIsConfirmedByEmail: false,
  },
  isAnonymousParticipationAllowed: {
    ...baseProps,
    step: {
      ...baseProps.step,
      isAnonymousParticipationAllowed: true,
    },
    isAuthenticated: false,
    viewerIsConfirmedByEmail: false,
  },
};

describe('<DebateStepPageVoteAndShare/>', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<DebateStepPageVoteAndShare {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly on mobile', () => {
    const wrapper = shallow(<DebateStepPageVoteAndShare {...props.onMobile} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when viewer not confirmed', () => {
    const wrapper = shallow(<DebateStepPageVoteAndShare {...props.viewerNotConfirmed} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when anonymous participation allowed', () => {
    const wrapper = shallow(
      <DebateStepPageVoteAndShare {...props.isAnonymousParticipationAllowed} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
