// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ModalDeleteVoteMobile } from './ModalDeleteVoteMobile';
import { $refType } from '~/mocks';

const props = {
  debate: {
    $refType,
    id: 'debateId',
    viewerVote: {
      type: 'FOR',
    },
  },
  setVoteState: jest.fn(),
  setShowArgumentForm: jest.fn(),
};

describe('<ModalDeleteVoteMobile />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<ModalDeleteVoteMobile {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
