// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalCreate } from './ProposalCreate';
import { $refType, $fragmentRefs, intlMock } from '../../../mocks';

describe('<ProposalCreate />', () => {
  it('should render correctly', () => {
    const defaultProps = {
      intl: intlMock,
      // $FlowFixMe $refType
      proposalForm: {
        $fragmentRefs,
        $refType,
        contribuable: true,
        id: '2',
        isProposalForm: true
      },
      showModal: true,
      submitting: true,
      pristine: true,
      dispatch: jest.fn(),
    };
    const wrapper = shallow(<ProposalCreate {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly as QuestionForm', () => {
    const defaultProps = {
      intl: intlMock,
      // $FlowFixMe $refType
      proposalForm: {
        $fragmentRefs,
        $refType,
        contribuable: true,
        id: '2',
        isProposalForm: false
      },
      showModal: true,
      submitting: true,
      pristine: true,
      dispatch: jest.fn(),
    };
    const wrapper = shallow(<ProposalCreate {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
