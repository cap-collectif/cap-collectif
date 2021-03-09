// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageVoteAndShare } from './DebateStepPageVoteAndShare';
import { $refType, $fragmentRefs } from '~/mocks';

const baseProps = {
  body: 'blabla le body',
  isAuthenticated: true,
  url: 'step/123',
  step: {
    url: 'step/123',
    $refType,
    $fragmentRefs,
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
};

const props = {
  basic: baseProps,
  onMobile: {
    ...baseProps,
    isMobile: true,
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
});
