/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
    expect(wrapper.find('.idea__preview__footer')).to.have.length(1);
    const messages = wrapper.find('FormattedMessage');
    expect(messages).to.have.length(1);
    expect(messages.find({ num: idea.votesCount })).to.have.length(1);
    expect(messages.find({ num: idea.commentsCount })).to.have.length(0);
  });

  it('should render comment counter when idea is commentable', () => {
    const wrapper = shallow(<IdeaPreviewFooter idea={ideaCommentable} {...IntlData} />);
    const messages = wrapper.find('FormattedMessage');
    expect(messages).to.have.length(2);
    expect(messages.find({ num: ideaCommentable.commentsCount })).to.have.length(1);
  });
});
