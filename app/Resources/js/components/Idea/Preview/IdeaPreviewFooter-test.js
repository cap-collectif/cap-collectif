/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
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
    const wrapper = shallow(<IdeaPreviewFooter idea={idea} />);
    expect(wrapper.find('.idea__preview__footer')).toHaveLength(1);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render comment counter when idea is commentable', () => {
    const wrapper = shallow(<IdeaPreviewFooter idea={ideaCommentable} />);
    expect(wrapper).toMatchSnapshot();
  });
});
