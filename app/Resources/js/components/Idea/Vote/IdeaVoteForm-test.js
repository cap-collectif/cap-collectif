// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';

import { IdeaVoteForm } from './IdeaVoteForm';

// eslint-disable-next-line react/prop-types
const idea = {
  userHasVote: false,
  commentable: true
};

const ideaWithVote = {
  userHasVote: true,
  commentable: true
};

const ideaNotCommentable = {
  userHasVote: false,
  commentable: false
};

describe('<IdeaVoteForm />', () => {
  it('should render the form with username, email, comment and private when user is not logged in', () => {
    const wrapper = shallow(
      <IdeaVoteForm anonymous idea={idea} hasCommentValue={false} isPrivate={false} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render the form with only comment and private when user is logged in', () => {
    const wrapper = shallow(
      <IdeaVoteForm anonymous={false} idea={idea} hasCommentValue={false} isPrivate={false} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not show comment field when private is checked', () => {
    const wrapper = shallow(
      <IdeaVoteForm anonymous idea={idea} isPrivate hasCommentValue={false} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not show private checkbox when comment is filled', () => {
    const wrapper = shallow(
      <IdeaVoteForm anonymous idea={idea} hasCommentValue isPrivate={false} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not show comment field or private checkbox when user has vote', () => {
    const wrapper = shallow(
      <IdeaVoteForm
        anonymous={false}
        idea={ideaWithVote}
        hasCommentValue={false}
        isPrivate={false}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not show comment field when idea is not commentable', () => {
    const wrapper = shallow(
      <IdeaVoteForm anonymous idea={ideaNotCommentable} hasCommentValue={false} isPrivate={false} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
