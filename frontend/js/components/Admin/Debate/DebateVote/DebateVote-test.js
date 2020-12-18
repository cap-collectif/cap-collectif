/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { DebateVote } from './DebateVote';
import { $refType } from '~/mocks';

const baseProps = {
  vote: {
    $refType,
    createdAt: '2020-02-01 00:03:00',
    value: 'FOR',
    author: {
      username: 'Vince',
      firstname: 'Vincent',
      lastname: 'Damssss',
    },
  },
};

const props = {
  basic: baseProps,
};

describe('<DebateVote />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<DebateVote {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });
});
