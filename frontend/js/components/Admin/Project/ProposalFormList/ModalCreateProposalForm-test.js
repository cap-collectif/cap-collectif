// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ModalCreateProposalForm from './ModalCreateProposalForm';
import { intlMock } from '~/mocks';

const props = {
  intl: intlMock,
  viewerId: 'viewer-123',
  isAdmin: true,
  orderBy: 'DESC',
  term: 'test de recherche',
  show: true,
  onClose: jest.fn(),
};

describe('<ModalCreateProposalForm  />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<ModalCreateProposalForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
