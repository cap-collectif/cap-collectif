// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ModalInternalMembers } from './ModalInternalMembers';

const baseProps = {
  onClose: jest.fn(),
  show: true,
  type: 'REGISTERED',
};

const props = {
  basic: baseProps,
  confirmedUsers: {
    ...baseProps,
    type: 'CONFIRMED',
  },
  notConfirmedUsers: {
    ...baseProps,
    type: 'NOT_CONFIRMED',
  },
};

describe('<ModalInternalMembers />', () => {
  it('should open with internal list with registered users', () => {
    const wrapper = shallow(<ModalInternalMembers {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should open with internal list with confirmed users', () => {
    const wrapper = shallow(<ModalInternalMembers {...props.confirmedUsers} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should open with internal list with not confirmed users', () => {
    const wrapper = shallow(<ModalInternalMembers {...props.notConfirmedUsers} />);
    expect(wrapper).toMatchSnapshot();
  });
});
