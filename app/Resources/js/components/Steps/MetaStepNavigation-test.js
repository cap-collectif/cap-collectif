// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { MetaStepNavigation, MetaStepNavigationShare, MetaStepNavigationTitle, MetaStepNavigationBackButton } from './MetaStepNavigation';
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

describe('<MetaStepNavigation />', () => {

  it('should render correctly for a ConsultationStep', () => {

    const wrapper = shallow(<MetaStepNavigation step={cStep}/>);
    expect(wrapper).toMatchSnapshot();
  });

});


describe('<MetaStepNavigationShare />', () => {

  it('should render correctly for a ConsultationStep', () => {

    const wrapper = shallow(<MetaStepNavigationShare step={cStep} />);
    expect(wrapper).toMatchSnapshot();
  });

});

describe('<MetaStepNavigationTitle />', () => {

  it('should render correctly for a ConsultationStep', () => {
    const wrapper = shallow(<MetaStepNavigationTitle step={cStep} />);
    expect(wrapper).toMatchSnapshot();
  });

});

describe('<MetaStepNavigationBackButton />', () => {

  it('should render correctly for a ConsultationStep', () => {
    const wrapper = shallow(<MetaStepNavigationBackButton step={cStep} />);
    expect(wrapper).toMatchSnapshot();
  });

});
