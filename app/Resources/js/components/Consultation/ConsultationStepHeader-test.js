// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ConsultationStepHeader } from './ConsultationStepHeader';
import { $refType } from '../../mocks';

describe('<ConsultationStepHeader />', () => {

  const step = {
    status: 'OPENED',
    timeless: false,
    timeRange: {
      startAt: new Date(2019, 6, 25).toDateString(),
      endAt: new Date(2019, 6, 25).toDateString(),
    },
    body: 'Je suis un beau body',
    $refType
  };

  it('renders correctly', () => {
    const wrapper = shallow(<ConsultationStepHeader step={step}/>);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when step does not have an end date', () => {
    const ownStep = {
      ...step,
      timeRange: {
        ...step.timeRange,
        endAt: null
      }
    };

    const wrapper = shallow(<ConsultationStepHeader step={ownStep}/>);
    expect(wrapper).toMatchSnapshot();
  });

});
