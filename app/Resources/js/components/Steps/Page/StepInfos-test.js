// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import StepInfos from './StepInfos';

describe('<StepInfos />', () => {
  const step = {
    counters: {},
    body: 'Coucou',
  };

  it('should render a step infos block, a CountersNav and a StepText', () => {
    const wrapper = shallow(<StepInfos step={step} />);
    expect(wrapper.find('div.step__infos.block')).toHaveLength(1);
    expect(wrapper.find('CountersNav')).toHaveLength(1);
    expect(wrapper.find('StepText')).toHaveLength(1);
  });
});
