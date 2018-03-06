/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { IdeaPageHeaderInfos } from './IdeaPageHeaderInfos';

const idea = {
  id: 1,
  createdAt: '2017-07-10T18:53:58+0200',
  updatedAt: '2017-07-10T18:53:58+0200',
  author: {},
  votesCount: 5,
};

const ideaWithTheme = {
  id: 1,
  createdAt: '2017-07-10T18:53:58+0200',
  updatedAt: '2017-07-10T18:53:58+0200',
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
  createdAt: '2017-07-10T18:53:58+0200',
  updatedAt: '2017-07-10T18:53:58+0200',
  author: {},
  trashed: true,
};

const ideaCommentable = {
  id: 1,
  createdAt: '2017-07-10T18:53:58+0200',
  updatedAt: '2017-07-10T18:53:58+0200',
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
    const wrapper = shallow(<IdeaPageHeaderInfos idea={idea} features={featuresThemesDisabled} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('p.media--aligned')).toHaveLength(1);
    expect(wrapper.find('#idea-votes-nb')).toHaveLength(1);
  });

  it('it should render a theme when idea has one and feature is activated', () => {
    const wrapper = shallow(
      <IdeaPageHeaderInfos features={featuresThemesEnabled} idea={ideaWithTheme} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('it should not render a theme when idea has one and feature is disabled', () => {
    const wrapper = shallow(
      <IdeaPageHeaderInfos features={featuresThemesDisabled} idea={ideaWithTheme} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('it should render comments number when idea is commentable', () => {
    const wrapper = shallow(
      <IdeaPageHeaderInfos features={featuresThemesDisabled} idea={ideaCommentable} />,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('#idea-comments-nb')).toHaveLength(1);
  });

  it('it should render trashed label when idea is trashed', () => {
    const wrapper = shallow(
      <IdeaPageHeaderInfos features={featuresThemesDisabled} idea={ideaTrashed} />,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('.label.label-default')).toHaveLength(1);
  });
});
