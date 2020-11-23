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
      proposalForm: {
        $fragmentRefs,
        $refType,
        contribuable: true,
        id: '2',
        objectType: 'PROPOSAL',
      },
      showModal: true,
      submitting: true,
      pristine: true,
      dispatch: jest.fn(),
      projectType: 'global.consultation',
    };
    const wrapper = shallow(<ProposalCreate {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly as QuestionForm', () => {
    const defaultProps = {
      intl: intlMock,
      proposalForm: {
        $fragmentRefs,
        $refType,
        contribuable: true,
        id: '2',
        objectType: 'QUESTION',
      },
      showModal: true,
      submitting: true,
      pristine: true,
      dispatch: jest.fn(),
      projectType: 'global.consultations',
    };
    const wrapper = shallow(<ProposalCreate {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
