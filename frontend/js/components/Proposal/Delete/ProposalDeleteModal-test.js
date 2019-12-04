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
});
