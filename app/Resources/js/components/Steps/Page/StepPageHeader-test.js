// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import StepPageHeader from './StepPageHeader';

describe('<StepPageHeader />', () => {
  const step = {
    title: '',
    counters: {},
    body: '',
    _links: {
      stats: 'https://www.test.com',
    },
  };

  it('should render a title and a StepInfos', () => {
    const wrapper = shallow(<StepPageHeader step={step} />);
    expect(wrapper.find('h2')).toHaveLength(1);
    expect(wrapper.find('StepInfos')).toHaveLength(1);
  });
});
