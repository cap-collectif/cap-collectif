// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ConsultationPropositionBox } from './ConsultationPropositionBox';
import IntlData from '../../translations/FR';

describe('<ConsultationPropositionBox />', () => {
  const props = {
    ...IntlData,
    step: { id: 'stepId' },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<ConsultationPropositionBox {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
