// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalCreateButton } from './ProposalCreateButton';

const defaultProps = {
  handleClick: jest.fn(),
  disabled: false,
};

describe('<ProposalCreateButton />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProposalCreateButton {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when disabled', () => {
    const props = {
      ...defaultProps,
      disabled: true,
    };
    const wrapper = shallow(<ProposalCreateButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
