// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalCreateButton } from './ProposalCreateButton';
import { $refType } from '../../../mocks';

describe('<ProposalCreateButton />', () => {
  it('should render correctly', () => {
    const props = {
      handleClick: jest.fn(),
      disabled: false,
      proposalForm: {
        $refType,
        isProposalForm: true,
      },
    };
    const wrapper = shallow(<ProposalCreateButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when disabled', () => {
    const props = {
      handleClick: jest.fn(),
      proposalForm: {
        $refType,
        isProposalForm: true,
      },
      disabled: true,
    };
    const wrapper = shallow(<ProposalCreateButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly as Question', () => {
    const props = {
      handleClick: jest.fn(),
      disabled: false,
      proposalForm: {
        $refType,
        isProposalForm: false,
      },
    };
    const wrapper = shallow(<ProposalCreateButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
