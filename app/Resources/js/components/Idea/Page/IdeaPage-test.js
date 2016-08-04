/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import { IdeaPage } from './IdeaPage';
import IdeaPageHeader from './IdeaPageHeader';
import IdeaPageBody from './IdeaPageBody';
import IdeaPageVotes from './IdeaPageVotes';
import IdeaPageComments from './IdeaPageComments';
import IdeaSidebar from '../Sidebar/IdeaSidebar';

const props = {
  themes: [],
  votes: [],
};

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
    const wrapper = shallow(<IdeaPage {...props} idea={idea} {...IntlData} />);
    const header = wrapper.find(IdeaPageHeader);
    expect(header).to.have.length(1);
    expect(header.prop('idea')).to.equal(idea);
    expect(header.prop('className')).to.equal('container container--thinner container--custom');
    const body = wrapper.find(IdeaPageBody);
    expect(body).to.have.length(1);
    expect(body.prop('idea')).to.equal(idea);
    expect(body.prop('themes')).to.equal(props.themes);
    expect(body.prop('className')).to.equal('container container--thinner container--custom');
    const votes = wrapper.find(IdeaPageVotes);
    expect(votes).to.have.length(1);
    expect(votes.prop('idea')).to.equal(idea);
    expect(votes.prop('votes')).to.equal(props.votes);
    expect(votes.prop('className')).to.equal('container container--thinner container--custom');
    const comments = wrapper.find(IdeaPageComments);
    expect(comments).to.have.length(1);
    expect(comments.prop('id')).to.equal(idea.id);
    expect(comments.prop('className')).to.equal('container container--thinner container--custom');
  });

  it('it should show the sidebar when idea is contribuable', () => {
    const wrapper = shallow(<IdeaPage {...props} idea={contribuableIdea} {...IntlData} />);
    const sidebar = wrapper.find(IdeaSidebar);
    expect(sidebar).to.have.length(1);
    expect(sidebar.prop('idea')).to.equal(contribuableIdea);
    expect(sidebar.prop('expanded')).to.equal(wrapper.state('expandSidebar'));
    expect(sidebar.prop('onToggleExpand')).to.be.a('function');
    expect(wrapper.find('#sidebar-overlay')).to.have.length(1);
    expect(wrapper.find('#sidebar-container.container.sidebar__container')).to.have.length(1);
  });

  it('it should not show the sidebar when idea is not contribuable', () => {
    const wrapper = shallow(<IdeaPage {...props} idea={uncontribuableIdea} {...IntlData} />);
    expect(wrapper.find(IdeaSidebar)).to.have.length(0);
    expect(wrapper.find('#sidebar-overlay')).to.have.length(0);
    expect(wrapper.find('#sidebar-container.container.sidebar__container')).to.have.length(0);
  });
});
