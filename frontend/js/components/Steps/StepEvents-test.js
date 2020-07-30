// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { StepEvents } from './StepEvents';
import { $refType, $fragmentRefs } from '../../mocks';

const step = {
  id: '<mocked-id>',
  events: {
    totalCount: 0,
    edges: [],
  },
  $refType,
};

describe('<StepEvents />', () => {
  it('should render nothing without events', () => {
    const wrapper = shallow(<StepEvents step={step} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render full width and no arrows with 1 event', () => {
    const wrapper = shallow(
      <StepEvents
        step={{
          ...step,
          events: { totalCount: 1, edges: [{ node: { id: 'event1', $fragmentRefs } }] },
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render without arrows with 2 events', () => {
    const wrapper = shallow(
      <StepEvents
        step={{
          ...step,
          events: { totalCount: 2, edges: [{ node: { id: 'event1', $fragmentRefs } }] },
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a sliders with 3 events', () => {
    const wrapper = shallow(
      <StepEvents
        step={{
          ...step,
          events: { totalCount: 3, edges: [{ node: { id: 'event1', $fragmentRefs } }] },
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
