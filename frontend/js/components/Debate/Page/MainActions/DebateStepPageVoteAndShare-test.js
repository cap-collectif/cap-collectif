// @flow
/* eslint-env jest */
import * as React from 'react';
import { render } from 'enzyme';
import { DebateStepPageVoteAndShare } from './DebateStepPageVoteAndShare';
import { $refType, $fragmentRefs } from '~/mocks';
import { MockProviders } from '~/testUtils';

const baseProps = {
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
};

const props = {
  basic: baseProps,
  onMobile: {
    ...baseProps,
    isMobile: true,
  },
  viewerNotConfirmed: {
    ...baseProps,
  },
  isAnonymousParticipationAllowed: {
    ...baseProps,
    step: {
      ...baseProps.step,
      isAnonymousParticipationAllowed: true,
    },
  },
};

const normalUser = { user: { isEmailConfirmed: true } };
const nonConfirmedUser = { user: { isEmailConfirmed: false } };

describe('<DebateStepPageVoteAndShare/>', () => {
  it('renders correctly', () => {
    const wrapper = render(
      <MockProviders store={{ user: normalUser }}>
        <DebateStepPageVoteAndShare {...props.basic} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly on mobile', () => {
    const wrapper = render(
      <MockProviders store={{ user: normalUser }}>
        <DebateStepPageVoteAndShare {...props.onMobile} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when viewer not confirmed', () => {
    const wrapper = render(
      <MockProviders store={{ user: nonConfirmedUser }}>
        <DebateStepPageVoteAndShare {...props.basic} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when anonymous participation allowed', () => {
    const wrapper = render(
      <MockProviders store={{ user: { user: null } }}>
        <DebateStepPageVoteAndShare {...props.isAnonymousParticipationAllowed} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
