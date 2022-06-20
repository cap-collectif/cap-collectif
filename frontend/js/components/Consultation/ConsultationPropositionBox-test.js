// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ConsultationPropositionBox } from './ConsultationPropositionBox';

describe('<ConsultationPropositionBox />', () => {
  const props = {
    id: 'stepId',
    consultationSlug: 'consultationSlug',
    dispatch: jest.fn(),
    showConsultationPlan: true,
    isAuthenticated: false,
  };

  it('renders correctly with plan', () => {
    const wrapper = shallow(<ConsultationPropositionBox {...props} consultationPlanEnabled />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without plan', () => {
    const wrapper = shallow(
      <ConsultationPropositionBox {...props} consultationPlanEnabled={false} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
