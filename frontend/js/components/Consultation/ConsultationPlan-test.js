// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ConsultationPlan } from './ConsultationPlan';
import { $refType, $fragmentRefs, intlMock } from '../../mocks';

describe('<ConsultationPlan />', () => {
  const props = {
    consultation: {
      id: 'myStep',
      $refType,
      sections: [{ sections: [], $fragmentRefs }, { sections: [], $fragmentRefs }],
    },
    closePlan: jest.fn(),
    openPlan: jest.fn(),
    showConsultationPlan: true,
    intl: intlMock,
  };

  it('renders null when < 2 sections', () => {
    const smallConsultation = {
      id: 'myStep',
      $refType,
      sections: [{ sections: [], $fragmentRefs }],
    };
    const wrapper = shallow(<ConsultationPlan {...props} consultation={smallConsultation} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders an open plan with a backToTop link', () => {
    global.document.body.scrollIntoView = jest.fn();
    const wrapper = shallow(<ConsultationPlan {...props} />);
    wrapper.find('#ConsultationPlan-backToTop').simulate('click');
    expect(wrapper).toMatchSnapshot();
    expect(global.document.body.scrollIntoView).toMatchSnapshot();
  });

  it('renders a closed plan', () => {
    const wrapper = shallow(<ConsultationPlan {...props} />);
    wrapper.find('#ConsultationPlan-close').simulate('click');
    expect(props.closePlan).toMatchSnapshot();

    wrapper.setProps({ showConsultationPlan: false });
    expect(wrapper).toMatchSnapshot('renders a closed plan');
    wrapper.find('#ConsultationPlan-open').simulate('click');
    expect(props.openPlan).toMatchSnapshot();

    wrapper.setProps({ showConsultationPlan: true });
    expect(wrapper).toMatchSnapshot('renders a reopen plan');
  });
});
