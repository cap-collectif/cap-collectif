// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageLogic } from './DebateStepPageLogic';
import { $refType, $fragmentRefs } from '~/mocks';

const baseProps = {
  query: {
    $refType,
    step: {
      $fragmentRefs,
      timeRange: {
        hasStarted: true,
      },
    },
    viewer: undefined,
  },
};

const props = {
  basic: baseProps,
  whenAuthenticated: {
    ...baseProps,
    query: {
      ...baseProps.query,
      viewer: {
        $fragmentRefs,
      },
    },
  },
  whenNotStarted: {
    ...baseProps,
    query: {
      ...baseProps.query,
      step: {
        ...baseProps.query.step,
        timeRange: {
          hasStarted: false,
        },
      },
    },
  },
};

describe('<DebateStepPageLogic />', () => {
  it('should renders correctly when not authenticated', () => {
    const wrapper = shallow(<DebateStepPageLogic {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when authenticated', () => {
    const wrapper = shallow(<DebateStepPageLogic {...props.whenAuthenticated} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when step not started', () => {
    const wrapper = shallow(<DebateStepPageLogic {...props.whenNotStarted} />);
    expect(wrapper).toMatchSnapshot();
  });
});
