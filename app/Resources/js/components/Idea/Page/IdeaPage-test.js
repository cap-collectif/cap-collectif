/* eslint-env jest */

import React from 'react';

import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import { IdeaPage } from './IdeaPage';
import IdeaPageHeader from './IdeaPageHeader';
import IdeaPageBody from './IdeaPageBody';
import IdeaPageVotes from './IdeaPageVotes';
import IdeaPageComments from './IdeaPageComments';
import IdeaSidebar from '../Sidebar/IdeaSidebar';

const contribuableIdea = {
  id: 1,
  canContribute: true,
};

const uncontribuableIdea = {
  id: 1,
  canContribute: false,
};

const idea = {
  id: 1,
};

describe('<IdeaPage />', () => {
  it('it should render the idea page with header, body, and votes and comments sections', () => {
    const wrapper = shallow(<IdeaPage idea={idea} {...IntlData} />);
    const header = wrapper.find(IdeaPageHeader);
    expect(header).toHaveLength(1);
    expect(header.prop('idea')).toEqual(idea);
    expect(header.prop('className')).toEqual('container container--thinner container--custom');
    const body = wrapper.find(IdeaPageBody);
    expect(body).toHaveLength(1);
    expect(body.prop('idea')).toEqual(idea);
    expect(body.prop('className')).toEqual('container container--thinner container--custom');
    const votes = wrapper.find(IdeaPageVotes);
    expect(votes).toHaveLength(1);
    expect(votes.prop('idea')).toEqual(idea);
    expect(votes.prop('className')).toEqual('container container--thinner container--custom');
    const comments = wrapper.find(IdeaPageComments);
    expect(comments).toHaveLength(1);
    expect(comments.prop('id')).toEqual(idea.id);
    expect(comments.prop('className')).toEqual('container container--thinner container--custom');
  });

  it('it should show the sidebar when idea is contribuable', () => {
    const wrapper = shallow(<IdeaPage idea={contribuableIdea} {...IntlData} />);
    const sidebar = wrapper.find(IdeaSidebar);
    expect(sidebar).toHaveLength(1);
    expect(sidebar.prop('idea')).toEqual(contribuableIdea);
    expect(sidebar.prop('expanded')).toEqual(wrapper.state('expandSidebar'));
    expect(sidebar.prop('onToggleExpand')).toBeDefined();
    expect(wrapper.find('#sidebar-overlay')).toHaveLength(1);
    expect(wrapper.find('#sidebar-container.container.sidebar__container')).toHaveLength(1);
  });

  it('it should not show the sidebar when idea is not contribuable', () => {
    const wrapper = shallow(<IdeaPage idea={uncontribuableIdea} {...IntlData} />);
    expect(wrapper.find(IdeaSidebar)).toHaveLength(0);
    expect(wrapper.find('#sidebar-overlay')).toHaveLength(0);
    expect(wrapper.find('#sidebar-container.container.sidebar__container')).toHaveLength(0);
  });
});
