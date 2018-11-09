// @flow
/* eslint-env jest */
import * as React from 'react';
import {shallow} from 'enzyme';
import {ProposalCreateButton} from './ProposalCreateButton';
import {$refType, $fragmentRefs} from '../../../mocks';

describe('<ProposalCreateButton />', () => {

  it('should render correctly', () => {
    const props = {
      handleClick: jest.fn(),
      disabled: false,
      // $FlowFixMe $refType
      proposalForm: {
        $refType,
        $fragmentRefs,
        isProposalForm: true
      }
    };
    const wrapper = shallow(<ProposalCreateButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when disabled', () => {
    const props = {
      handleClick: jest.fn(),
      // $FlowFixMe $refType
      proposalForm: {
        $refType,
        $fragmentRefs,
        isProposalForm: true
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
      // $FlowFixMe $refType
      proposalForm: {
        $refType,
        $fragmentRefs,
        isProposalForm: false
      }
    };
    const wrapper = shallow(<ProposalCreateButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
