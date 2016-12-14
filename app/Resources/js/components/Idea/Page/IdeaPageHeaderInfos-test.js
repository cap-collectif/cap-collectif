/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import { IdeaPageHeaderInfos } from './IdeaPageHeaderInfos';
import UserLink from '../../User/UserLink';

const idea = {
  id: 1,
  author: {},
  votesCount: 5,
};

const ideaWithTheme = {
  id: 1,
  author: {},
  theme: {
    title: 'Theme',
    _links: {
      show: '',
    },
  },
};

const ideaTrashed = {
  id: 1,
  author: {},
  trashed: true,
};

const ideaCommentable = {
  id: 1,
  author: {},
  commentable: true,
  commentsCount: 10,
};

const featuresThemesEnabled = {
  themes: true,
};

const featuresThemesDisabled = {
  themes: false,
};

describe('<IdeaPageHeaderInfos />', () => {
  it('it should render a paragraph with formatted messages for user and votes', () => {
    const wrapper = shallow(<IdeaPageHeaderInfos idea={idea} features={featuresThemesDisabled} {...IntlData} />);
    expect(wrapper.find('p.media--aligned')).toHaveLength(1);
    const messages = wrapper.find('FormattedMessage');
    expect(messages).toHaveLength(2);
    const userLink = <UserLink user={idea.author} />;
    expect(messages.find({ user: userLink })).toHaveLength(1);
    expect(wrapper.find('#idea-votes-nb')).toHaveLength(1);
    expect(messages.find({ num: idea.votesCount })).toHaveLength(1);
  });

  it('it should render a theme when idea has one and feature is activated', () => {
    const wrapper = shallow(<IdeaPageHeaderInfos features={featuresThemesEnabled} idea={ideaWithTheme} {...IntlData} />);
    const messages = wrapper.find('FormattedMessage');
    expect(messages).toHaveLength(2);
    const themeLink = <a href={ideaWithTheme.theme._links.show}>{ideaWithTheme.theme.title}</a>;
    expect(messages.find({ theme: themeLink })).toHaveLength(1);
  });

  it('it should not render a theme when idea has one and feature is disabled', () => {
    const wrapper = shallow(<IdeaPageHeaderInfos features={featuresThemesDisabled} idea={ideaWithTheme} {...IntlData} />);
    const messages = wrapper.find('FormattedMessage');
    expect(messages).toHaveLength(2);
    const themeLink = <a href={ideaWithTheme.theme._links.show}>{ideaWithTheme.theme.title}</a>;
    expect(messages.find({ themeLink })).toHaveLength(0);
  });

  it('it should render comments number when idea is commentable', () => {
    const wrapper = shallow(<IdeaPageHeaderInfos features={featuresThemesDisabled} idea={ideaCommentable} {...IntlData} />);
    expect(wrapper.find('#idea-comments-nb')).toHaveLength(1);
    const messages = wrapper.find('FormattedMessage');
    expect(messages).toHaveLength(3);
    expect(messages.find({ num: idea.commentsCount })).toHaveLength(1);
  });

  it('it should render trashed label when idea is trashed', () => {
    const wrapper = shallow(<IdeaPageHeaderInfos features={featuresThemesDisabled} idea={ideaTrashed} {...IntlData} />);
    expect(wrapper.find('.label.label-default')).toHaveLength(1);
  });
});
