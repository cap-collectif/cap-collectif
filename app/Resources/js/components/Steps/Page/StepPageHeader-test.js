// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import StepPageHeader from './StepPageHeader';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<StepPageHeader />', () => {
  const defaultStep = {
    $refType,
    $fragmentRefs,
    title: 'I am a title',
    startAt: '',
    endAt: '',
    status: 'OPENED',
    timeless: false,
    type: 'consultation',
  };
  /*
    _links: {
      stats: 'https://www.test.com',
    },
    */

  it('should render correctly a consultationStep', () => {
    const wrapper = shallow(<StepPageHeader step={defaultStep} />);
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
