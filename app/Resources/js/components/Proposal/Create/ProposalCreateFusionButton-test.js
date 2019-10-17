// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalCreateFusionButton } from './ProposalCreateFusionButton';

const defaultProps = {
  showModal: true,
  submitting: false,
  pristine: true,
  invalid: true,
  open: jest.fn(),
  close: jest.fn(),
  submitForm: jest.fn(),
};

describe('<ProposalCreateFusionButton />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProposalCreateFusionButton {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when submitting', () => {
    const props = {
      ...defaultProps,
      submitting: true,
    };
    const wrapper = shallow(<ProposalCreateFusionButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
