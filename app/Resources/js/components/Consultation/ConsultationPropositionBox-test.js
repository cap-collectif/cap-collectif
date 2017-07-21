// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ConsultationPropositionBox } from './ConsultationPropositionBox';

describe('<ConsultationPropositionBox />', () => {
  const props = {
    step: { id: 'stepId' },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<ConsultationPropositionBox {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
