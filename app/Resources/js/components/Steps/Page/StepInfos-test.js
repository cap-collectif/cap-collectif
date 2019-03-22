// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { StepInfos } from './StepInfos';
import { $refType } from '../../../mocks';

describe('<StepInfos />', () => {
  const step = {
    $refType,
    body: 'Coucou',
  };

  it('should render correcty', () => {
    const wrapper = shallow(<StepInfos step={step} />);
    expect(wrapper).toMatchSnapshot();
  });
});
