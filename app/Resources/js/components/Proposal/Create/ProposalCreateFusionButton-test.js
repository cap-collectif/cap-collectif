// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalCreateFusionButton } from './ProposalCreateFusionButton';
import { $refType } from '../../../mocks';

const defaultProps = {
  showModal: true,
  submitting: false,
  pristine: true,
  invalid: true,
  open: jest.fn(),
  close: jest.fn(),
  submitForm: jest.fn(),
  query: {
    $refType,
    projects: {
      edges: [
        {
          node: {
            id: '1',
            title: 'Project 1',
            steps: [{ id: 's1', type: 'collect' }, { id: 's2', type: 'depot' }],
          },
        },
        {
          node: {
            id: '2',
            title: 'Project 2',
            steps: [],
          },
        },
      ],
    },
  },
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
