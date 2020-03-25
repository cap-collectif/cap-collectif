// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalContactModal } from './ProposalContactModal';
import { formMock } from '../../../mocks';

describe('<ProposalContactModal />', () => {
  it('renders correctly', () => {
    const props = {
      ...formMock,
      proposalId: 'proposalId324Z',
      authorName: 'Gertrude',
      onClose: jest.fn(),
      onSubmit: jest.fn(),
      addCaptchaField: false,
      show: false,
    };
    const wrapper = shallow(<ProposalContactModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
