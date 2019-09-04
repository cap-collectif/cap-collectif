// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { MetaStepNavigationBox } from './MetaStepNavigationBox'

describe('<MetaStepNavigationBox />', () => {

  it('should render correctly', () => {

    const props = {
      stepId: 'cstep1',
      relatedSlug: 'deuxieme-consultation'
    };

    const wrapper = shallow(<MetaStepNavigationBox {...props}/>);
    expect(wrapper).toMatchSnapshot();
  });

});
