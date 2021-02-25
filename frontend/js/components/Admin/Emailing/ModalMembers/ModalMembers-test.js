// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ModalMembers } from './ModalMembers';
import { $refType } from '~/mocks';

const baseProps = {
  onClose: jest.fn(),
  show: true,
  mailingList: {
    $refType,
    id: 'mailingList-123',
    name: 'Je suis une mailing list',
  },
};

const props = {
  withData: baseProps,
};

describe('<ModalMembers />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ModalMembers {...props.withData} />);
    expect(wrapper).toMatchSnapshot();
  });
});
