/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import StepPageHeader from './StepPageHeader';

describe('<StepPageHeader />', () => {
  const step = {
    title: '',
    counters: {},
    body: '',
  };

  it('should render a title and a StepInfos', () => {
    const wrapper = shallow(<StepPageHeader step={step} />);
    expect(wrapper.find('h2')).to.have.length(1);
    expect(wrapper.find('StepInfos')).to.have.length(1);
  });
});
