// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ConsultationListBox } from './ConsultationListBox';

describe('<ConsultationListBox />', () => {
  const props = {
    id: 'cstep1'
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ConsultationListBox {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

});
