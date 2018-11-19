// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalCreate } from './ProposalCreate';
import { $refType, $fragmentRefs, intlMock } from '../../../mocks';

const defaultProps = {
  intl: intlMock,
  proposalForm: {
    $fragmentRefs,
    $refType,
    contribuable: true,
    id: '2',
  },
  showModal: true,
  submitting: true,
  pristine: true,
  dispatch: jest.fn(),
};

describe('<ProposalCreate />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProposalCreate {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
