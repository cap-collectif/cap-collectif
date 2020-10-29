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
    name: 'Je suis une mailing list',
    users: {
      totalCount: 2,
      edges: [
        {
          node: {
            id: '1',
            email: 'bruh@gmail.com',
          },
        },
        {
          node: {
            id: '2',
            email: 'bro@gmail.com',
          },
        },
      ],
    },
  },
};

const props = {
  withData: baseProps,
};

describe('<ModalMembers />', () => {
  it('should open with data', () => {
    const wrapper = shallow(<ModalMembers {...props.withData} />);
    expect(wrapper).toMatchSnapshot();
  });
});
