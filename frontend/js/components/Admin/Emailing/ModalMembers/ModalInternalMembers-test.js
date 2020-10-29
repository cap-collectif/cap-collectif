// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ModalInternalMembers } from './ModalInternalMembers';

const baseProps = {
  onClose: jest.fn(),
  show: true,
  mailingListName: 'Je suis une mailing list',
  members: {
    totalCount: 2,
    edges: [
      {
        node: {
          id: '1',
          email: 'bruh@gmail.com',
          isEmailConfirmed: true,
        },
      },
      {
        node: {
          id: '2',
          email: 'bro@gmail.com',
          isEmailConfirmed: false,
        },
      },
    ],
  },
};

const props = {
  withData: baseProps,
};

describe('<ModalInternalMembers />', () => {
  it('should open with data', () => {
    const wrapper = shallow(<ModalInternalMembers {...props.withData} />);
    expect(wrapper).toMatchSnapshot();
  });
});
