// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageLogic } from './DebateStepPageLogic';
import { $refType, $fragmentRefs } from '~/mocks';

const baseProps = {
  query: {
    $refType,
    step: { $fragmentRefs },
    viewer: {
      $fragmentRefs,
    },
  },
  isAuthenticated: false,
};

const props = {
  basic: baseProps,
  whenAuthenticated: {
    ...baseProps,
    isAuthenticated: true,
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
});
