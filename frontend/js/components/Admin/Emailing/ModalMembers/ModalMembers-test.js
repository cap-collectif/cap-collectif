// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ModalMembers } from './ModalMembers';

const baseProps = {
  onClose: jest.fn(),
  data: {
    mailingListName: 'Je suis une mailing list',
    mailingListMembers: {
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
