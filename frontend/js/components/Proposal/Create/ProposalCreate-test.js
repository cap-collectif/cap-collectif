// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalCreate } from './ProposalCreate';
import { $refType, $fragmentRefs } from '~/mocks';

const defaultProps = {
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
  invalid: false,
  dispatch: jest.fn(),
  projectType: 'global.consultation',
};

const props = {
  basic: defaultProps,
  withError: { ...defaultProps, invalid: true },
  asQuestionnaire: {
    ...defaultProps,
    proposalForm: {
      ...defaultProps.proposalForm,
      objectType: 'QUESTION',
    },
  },
};

describe('<ProposalCreate />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProposalCreate {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with error', () => {
    const wrapper = shallow(<ProposalCreate {...props.withError} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly as QuestionForm', () => {
    const wrapper = shallow(<ProposalCreate {...props.asQuestionnaire} />);
    expect(wrapper).toMatchSnapshot();
  });
});
