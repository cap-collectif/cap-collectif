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
        objectType: 'PROPOSAL',
      },
      projectType: 'global.consultation',
    };
    const wrapper = shallow(<ProposalCreateButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when disabled', () => {
    const props = {
      handleClick: jest.fn(),
      proposalForm: {
        $refType,
        objectType: 'PROPOSAL',
      },
      disabled: true,
      projectType: 'global.consultation',
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
        objectType: 'QUESTION',
      },
      projectType: 'global.consultation',
    };
    const wrapper = shallow(<ProposalCreateButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly as Interpellation', () => {
    const props = {
      handleClick: jest.fn(),
      disabled: false,
      proposalForm: {
        $refType,
        objectType: 'PROPOSAL',
      },
      projectType: 'project.types.interpellation',
    };
    const wrapper = shallow(<ProposalCreateButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly as tipsmeee', () => {
    const props = {
      handleClick: jest.fn(),
      disabled: false,
      proposalForm: {
        $refType,
        objectType: 'PROPOSAL',
      },
      projectType: 'project.types.budgetPart',
    };
    const wrapper = shallow(<ProposalCreateButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
