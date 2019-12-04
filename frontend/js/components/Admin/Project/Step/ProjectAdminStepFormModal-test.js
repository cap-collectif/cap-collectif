// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminStepFormModal } from './ProjectAdminStepFormModal';

describe('<ProjectAdminStepFormModal />', () => {
  const defaultProps = {
    dispatch: jest.fn(),
    onClose: jest.fn(),
    show: true,
    submitting: false,
    form: 'ProjectAdminStepForm',
    step: null,
  };

  it('renders correctly', () => {
    const wrapper = shallow(<ProjectAdminStepFormModal {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly hided', () => {
    const props = {
      ...defaultProps,
      show: false,
    };
    const wrapper = shallow(<ProjectAdminStepFormModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly submitting', () => {
    const props = {
      ...defaultProps,
      submitting: true,
    };
    const wrapper = shallow(<ProjectAdminStepFormModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with step', () => {
    const props = {
      ...defaultProps,
      step: {
        title: 'test',
      },
    };
    const wrapper = shallow(<ProjectAdminStepFormModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
