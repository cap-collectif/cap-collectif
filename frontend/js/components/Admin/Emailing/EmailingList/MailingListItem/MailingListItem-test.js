// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { MailingListItem } from './MailingListItem';
import { $refType } from '~/mocks';

const baseProps = {
  rowId: '1',
  mailingList: {
    $refType,
    id: '1',
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
            id: '1',
            email: 'bruh@gmail.com',
          },
        },
      ],
    },
    project: {
      title: 'Je suis un titre de projet',
    },
  },
  selected: false,
  setMailingListModal: jest.fn(),
};

const props = {
  basic: baseProps,
  selected: { ...baseProps, selected: true },
};

describe('<MailingListItem />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<MailingListItem {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when selected', () => {
    const wrapper = shallow(<MailingListItem {...props.selected} />);
    expect(wrapper).toMatchSnapshot();
  });
});
