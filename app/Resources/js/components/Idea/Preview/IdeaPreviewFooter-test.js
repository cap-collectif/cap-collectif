/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeaPreviewFooter from './IdeaPreviewFooter';

const idea = {
  id: 1,
  commentable: false,
  votesCount: 10,
  commentsCount: 0,
};

const ideaCommentable = {
  id: 1,
  title: 'Title',
  commentable: true,
  votesCount: 10,
  commentsCount: 5,
};

describe('<IdeaPreviewFooter />', () => {
  it('should render idea preview footer with votes counter', () => {
    const wrapper = shallow(<IdeaPreviewFooter idea={idea} {...IntlData} />);
    expect(wrapper.find('.idea__preview__footer')).toHaveLength(1);
    const messages = wrapper.find('FormattedMessage');
    expect(messages).toHaveLength(1);
    expect(messages.find({ num: idea.votesCount })).toHaveLength(1);
    expect(messages.find({ num: idea.commentsCount })).toHaveLength(0);
  });

  it('should render comment counter when idea is commentable', () => {
    const wrapper = shallow(<IdeaPreviewFooter idea={ideaCommentable} {...IntlData} />);
    const messages = wrapper.find('FormattedMessage');
    expect(messages).toHaveLength(2);
    expect(messages.find({ num: ideaCommentable.commentsCount })).toHaveLength(1);
  });
});
