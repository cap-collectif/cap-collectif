// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ModalCreateProposalForm from './ModalCreateProposalForm';
import { intlMock, $fragmentRefs } from '~/mocks';

const props = {
  intl: intlMock,
  viewer: {
    id: 'viewer-123',
    __typename: 'User',
    username: 'toto',
    allProposalForm: {
      totalCount: 1,
    },
    $fragmentRefs,
  },
  isAdmin: true,
  orderBy: 'DESC',
  term: 'test de recherche',
  show: true,
  onClose: jest.fn(),
  hasProposalForm: false,
};

describe('<ModalCreateProposalForm  />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<ModalCreateProposalForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
