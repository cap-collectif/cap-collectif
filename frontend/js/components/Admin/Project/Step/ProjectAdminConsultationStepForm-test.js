// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminConsultationStepForm } from './ProjectAdminConsultationStepForm';

describe('<ProjectAdminConsultationStepForm />', () => {
  const defaultProps = {
    consultations: [],
    dispatch: jest.fn(),
    fcAllowedData: { FIRSTNAME: true, LASTNAME: true, DATE_OF_BIRTH: false },
    isFranceConnectConfigured: true,
  };

  it('renders correctly with no initial data', () => {
    const wrapper = shallow(<ProjectAdminConsultationStepForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with data', () => {
    const props = {
      ...defaultProps,
      consultations: [
        { label: 'c1', value: 'consultation1' },
        { label: 'c2', value: 'consultation2' },
      ],
      requirements: [{ type: 'CHECKBOX', checked: false, label: 'Sku' }],
    };
    const wrapper = shallow(<ProjectAdminConsultationStepForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
