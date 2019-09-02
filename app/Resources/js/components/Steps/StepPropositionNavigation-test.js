// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { StepPropositionNavigation, StepNavigationTypeShare, StepNavigationTypeTitle, StepNavigationTypeBackButton } from './StepPropositionNavigation';
import { $refType } from '../../mocks'

const cStep = {
  __typename: 'ConsultationStep',
  url: 'https://capco.dev/project/strategie-technologique-de-letat-et-services-publics/consultation/etape-de-multi-consultation',
  consultation: {
    url: 'https://capco.dev/project/strategie-technologique-de-letat-et-services-publics/consultation/etape-de-multi-consultation/consultation/deuxieme-consultation',
    title: 'Deuxième consultation'
  },
  $refType,
};

describe('<StepPropositionNavigation />', () => {

  it('should render correctly for a ConsultationStep', () => {

    const wrapper = shallow(<StepPropositionNavigation step={cStep}/>);
    expect(wrapper).toMatchSnapshot();
  });

});


describe('<StepNavigationTypeShare />', () => {

  it('should render correctly for a ConsultationStep', () => {

    const wrapper = shallow(<StepNavigationTypeShare step={cStep} />);
    expect(wrapper).toMatchSnapshot();
  });

});

describe('<StepNavigationTypeTitle />', () => {

  it('should render correctly for a ConsultationStep', () => {
    const wrapper = shallow(<StepNavigationTypeTitle step={cStep} />);
    expect(wrapper).toMatchSnapshot();
  });

});

describe('<StepNavigationTypeBackButton />', () => {

  it('should render correctly for a ConsultationStep', () => {
    const wrapper = shallow(<StepNavigationTypeBackButton step={cStep} />);
    expect(wrapper).toMatchSnapshot();
  });

});
