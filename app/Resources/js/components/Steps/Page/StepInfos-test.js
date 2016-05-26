/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import StepInfos from './StepInfos';

describe('<StepInfos />', () => {
  const step = {
    counters: {},
    body: 'Coucou',
  };

  it('should render a step infos block, a CountersNav and a StepText', () => {
    const wrapper = shallow(<StepInfos step={step} />);
    expect(wrapper.find('div.step__infos.block.block--bordered')).to.have.length(1);
    expect(wrapper.find('CountersNav')).to.have.length(1);
    expect(wrapper.find('StepText')).to.have.length(1);
  });
});
