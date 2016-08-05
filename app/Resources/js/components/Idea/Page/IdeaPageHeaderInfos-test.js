/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
    expect(wrapper.find('p.media--aligned')).to.have.length(1);
    const messages = wrapper.find('FormattedMessage');
    expect(messages).to.have.length(2);
    const userLink = <UserLink user={idea.author} />;
    expect(messages.find({ user: userLink })).to.have.length(1);
    expect(wrapper.find('#idea-votes-nb')).to.have.length(1);
    expect(messages.find({ num: idea.votesCount })).to.have.length(1);
  });

  it('it should render a theme when idea has one and feature is activated', () => {
    const wrapper = shallow(<IdeaPageHeaderInfos features={featuresThemesEnabled} idea={ideaWithTheme} {...IntlData} />);
    const messages = wrapper.find('FormattedMessage');
    expect(messages).to.have.length(2);
    const themeLink = <a href={ideaWithTheme.theme._links.show}>{ideaWithTheme.theme.title}</a>;
    expect(messages.find({ theme: themeLink })).to.have.length(1);
  });

  it('it should not render a theme when idea has one and feature is disabled', () => {
    const wrapper = shallow(<IdeaPageHeaderInfos features={featuresThemesDisabled} idea={ideaWithTheme} {...IntlData} />);
    const messages = wrapper.find('FormattedMessage');
    expect(messages).to.have.length(2);
    const themeLink = <a href={ideaWithTheme.theme._links.show}>{ideaWithTheme.theme.title}</a>;
    expect(messages.find({ themeLink })).to.have.length(0);
  });

  it('it should render comments number when idea is commentable', () => {
    const wrapper = shallow(<IdeaPageHeaderInfos features={featuresThemesDisabled} idea={ideaCommentable} {...IntlData} />);
    expect(wrapper.find('#idea-comments-nb')).to.have.length(1);
    const messages = wrapper.find('FormattedMessage');
    expect(messages).to.have.length(3);
    expect(messages.find({ num: idea.commentsCount })).to.have.length(1);
  });

  it('it should render trashed label when idea is trashed', () => {
    const wrapper = shallow(<IdeaPageHeaderInfos features={featuresThemesDisabled} idea={ideaTrashed} {...IntlData} />);
    expect(wrapper.find('.label.label-default')).to.have.length(1);
  });
});
