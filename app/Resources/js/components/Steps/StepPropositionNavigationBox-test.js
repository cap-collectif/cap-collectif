// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { StepPropositionNavigationBox } from './StepPropositionNavigationBox'

describe('<StepPropositionNavigationBox />', () => {

  it('should render correctly', () => {

    const props = {
      stepId: 'cstep1',
      relatedSlug: 'deuxieme-consultation'
    };

    const wrapper = shallow(<StepPropositionNavigationBox {...props}/>);
    expect(wrapper).toMatchSnapshot();
  });

});
