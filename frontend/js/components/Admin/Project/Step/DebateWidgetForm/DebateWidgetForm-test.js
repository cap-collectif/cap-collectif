// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateWidgetForm } from './DebateWidgetForm';

const baseProps = {
  debateId: 'debate-123',
  widget: {
    background: '#fff',
    border: '#fff',
    width: '100%',
    height: '90vh',
    destination: null,
  },
};

const props = {
  basic: baseProps,
  withWidgetDestination: {
    ...baseProps,
    widget: {
      ...baseProps.widget,
      destination: 'https://google.com',
    },
  },
};

describe('<DebateWidgetForm />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<DebateWidgetForm {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly with widget destination', () => {
    const wrapper = shallow(<DebateWidgetForm {...props.withWidgetDestination} />);
    expect(wrapper).toMatchSnapshot();
  });
});
