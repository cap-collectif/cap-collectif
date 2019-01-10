// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import StepInfos from './StepInfos';

describe('<StepInfos />', () => {
  const step = {
    body: 'Coucou',
  };

  it('should render correcty', () => {
    const wrapper = shallow(<StepInfos step={step} />);
    expect(wrapper).toMatchSnapshot();
  });
});
