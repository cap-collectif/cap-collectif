// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { IdeaVoteBox } from './IdeaVoteBox';

const props = {
  idea: {},
  submitting: false,
  dispatch: jest.fn()
};

const propsWithVote = {
  idea: {
    userHasVote: true
  },
  submitting: false,
  dispatch: jest.fn()
};

const user = {};

describe('<IdeaVoteBox />', () => {
  it('should render the create idea vote form with no user avatar when user is not logged in', () => {
    const wrapper = shallow(<IdeaVoteBox {...props} user={null} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render the create idea vote form with user avatar when user is logged in', () => {
    const wrapper = shallow(<IdeaVoteBox {...props} user={user} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render the delete idea vote form with user avatar when user is logged in and has voted', () => {
    const wrapper = shallow(<IdeaVoteBox {...propsWithVote} user={user} />);
    expect(wrapper).toMatchSnapshot();
  });
});
