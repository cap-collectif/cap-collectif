// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminConsultationStepForm } from './ProjectAdminConsultationStepForm';

describe('<ProjectAdminStepFormModal />', () => {
  const defaultProps = {
    consultations: [],
    dispatch: jest.fn(),
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
