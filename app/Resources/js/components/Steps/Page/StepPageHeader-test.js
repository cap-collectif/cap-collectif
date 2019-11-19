// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { StepPageHeader } from './StepPageHeader';
import { $refType } from '../../../mocks';

describe('<StepPageHeader />', () => {
  const defaultStep = {
    $refType,
    title: 'I am a title',
    body: null,
    timeRange: {
      startAt: null,
      endAt: null,
    },
    status: 'OPENED',
    timeless: false,
    type: 'consultation',
  };

  it('should render correctly a consultationStep', () => {
    const wrapper = shallow(<StepPageHeader step={defaultStep} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly a consultationStep with a description', () => {
    const step = {
      ...defaultStep,
      body: 'Je suis la belle description'
    };
    const wrapper = shallow(<StepPageHeader step={step} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly a selectionStep', () => {
    const step = { ...defaultStep, type: 'selection', voteThreshold: 1, votable: true };
    const wrapper = shallow(<StepPageHeader step={step} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly a questionnaireStep', () => {
    const step = { ...defaultStep, type: 'questionnaire' };
    const wrapper = shallow(<StepPageHeader step={step} />);
    expect(wrapper).toMatchSnapshot();
  });
});
