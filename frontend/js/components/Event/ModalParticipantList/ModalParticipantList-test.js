/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ModalParticipantList } from './ModalParticipantList';
import { $refType, $fragmentRefs } from '~/mocks';

const event = {
  $refType,
  participants: {
    edges: [
      {
        node: {
          $fragmentRefs,
        },
      },
    ],
  },
};

describe('<ModalParticipantList />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ModalParticipantList event={event} show onClose={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });
});
