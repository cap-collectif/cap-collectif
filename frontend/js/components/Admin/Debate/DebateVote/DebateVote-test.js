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
    __typename: 'DebateVote',
    type: 'FOR',
    author: {
      username: 'Vince',
      firstname: 'Vincent',
      lastname: 'Damssss',
    },
  },
};

const withAnonymousProps = {
  vote: {
    $refType,
    createdAt: '2020-02-01 00:03:00',
    __typename: 'DebateAnonymousVote',
    type: 'FOR',
  },
};

const props = {
  basic: baseProps,
  anonymous: withAnonymousProps,
};

describe('<DebateVote />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<DebateVote {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with anonymous votes', () => {
    const wrapper = shallow(<DebateVote {...props.anonymous} />);
    expect(wrapper).toMatchSnapshot();
  });
});
