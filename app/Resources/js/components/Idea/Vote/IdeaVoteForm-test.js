/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import IdeaVoteForm from './IdeaVoteForm';
import FlashMessages from '../../Utils/FlashMessages';

const idea = {
  userHasVote: false,
  commentable: true,
};

const ideaWithVote = {
  userHasVote: true,
  commentable: true,
};

const ideaNotCommentable = {
  userHasVote: false,
  commentable: false,
};

describe('<IdeaVoteForm />', () => {
  it('should render the form with username, email, comment and private when user is not logged in', () => {
    const wrapper = shallow(<IdeaVoteForm anonymous idea={idea} />);
    expect(wrapper.find(FlashMessages)).toHaveLength(1);
    expect(wrapper.find('form')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-username')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-email')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-private')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-comment')).toHaveLength(1);
  });

  it('should render the form with only comment and private when user is not logged in', () => {
    const wrapper = shallow(<IdeaVoteForm anonymous={false} idea={idea} />);
    expect(wrapper.find(FlashMessages)).toHaveLength(1);
    expect(wrapper.find('form')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-username')).toHaveLength(0);
    expect(wrapper.find('#idea-vote-email')).toHaveLength(0);
    expect(wrapper.find('#idea-vote-private')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-comment')).toHaveLength(1);
  });

  it('should not show comment field when private is checked', () => {
    const wrapper = shallow(<IdeaVoteForm anonymous idea={idea} />);
    expect(wrapper.find(FlashMessages)).toHaveLength(1);
    expect(wrapper.find('form')).toHaveLength(1);
    const state = wrapper.state();
    const form = state.form;
    form.private = true;
    state.form = form;
    wrapper.setState(form);
    expect(wrapper.find('#idea-vote-username')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-email')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-private')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-comment')).toHaveLength(0);
  });

  it('should not show private checkbox when comment is filled', () => {
    const wrapper = shallow(<IdeaVoteForm anonymous idea={idea} />);
    expect(wrapper.find(FlashMessages)).toHaveLength(1);
    expect(wrapper.find('form')).toHaveLength(1);
    const state = wrapper.state();
    const form = state.form;
    form.comment = 'hello';
    state.form = form;
    wrapper.setState(form);
    expect(wrapper.find('#idea-vote-username')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-email')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-private')).toHaveLength(0);
    expect(wrapper.find('#idea-vote-comment')).toHaveLength(1);
  });

  it('should not show comment field nor private checkbox when user has vote', () => {
    const wrapper = shallow(
      <IdeaVoteForm anonymous={false} idea={ideaWithVote} />,
    );
    expect(wrapper.find(FlashMessages)).toHaveLength(1);
    expect(wrapper.find('form')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-username')).toHaveLength(0);
    expect(wrapper.find('#idea-vote-email')).toHaveLength(0);
    expect(wrapper.find('#idea-vote-private')).toHaveLength(0);
    expect(wrapper.find('#idea-vote-comment')).toHaveLength(0);
  });

  it('should not show comment field when idea is not commentable', () => {
    const wrapper = shallow(
      <IdeaVoteForm anonymous idea={ideaNotCommentable} />,
    );
    expect(wrapper.find(FlashMessages)).toHaveLength(1);
    expect(wrapper.find('form')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-username')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-email')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-private')).toHaveLength(1);
    expect(wrapper.find('#idea-vote-comment')).toHaveLength(0);
  });
});
