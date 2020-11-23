// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalDeleteModal } from './ProposalDeleteModal';
import { $refType } from '../../../mocks';

const defaultProps = {
  form: Object,
  proposal: {
    $refType,
    id: '1',
    title: 'Flammenwerfer',
    form: {
      objectType: 'PROPOSAL',
    },
    project: {
      type: {
        title: 'global.consultation',
      },
    },
  },
  show: true,
  isDeleting: false,
  dispatch: jest.fn(),
};

const interpellationProps = {
  form: Object,
  proposal: {
    $refType,
    id: '1',
    title: 'Flammenwerfer',
    form: {
      objectType: 'PROPOSAL',
    },
    project: {
      type: {
        title: 'project.types.interpellation',
      },
    },
  },
  show: true,
  isDeleting: false,
  dispatch: jest.fn(),
};

describe('<ProposalDeleteModal />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProposalDeleteModal {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly in interpellation context', () => {
    const wrapper = shallow(<ProposalDeleteModal {...interpellationProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
