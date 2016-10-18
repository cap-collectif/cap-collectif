/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { ProposalPage } from './ProposalPage';
import IntlData from '../../../translations/FR';
import { Tab, Nav, NavItem } from 'react-bootstrap';
import { VOTE_TYPE_SIMPLE, VOTE_TYPE_DISABLED } from '../../../constants/ProposalConstants';

describe('<ProposalPage />', () => {
  const props = {
    form: {
      usingThemes: true,
      usingCategories: false,
    },
    themes: [],
    districts: [],
    categories: [],
    features: {
      themes: true,
      districts: false,
    },
    steps: [
      { id: 1, voteType: VOTE_TYPE_DISABLED },
      { id: 2, voteType: VOTE_TYPE_SIMPLE },
    ],
  };

  const proposalNoVotes = {
    id: 41,
    votableStepId: 2,
    votesCountByStepId: {
      2: 0,
    },
    comments_count: 5,
  };
  const proposalWithVotes = {
    id: 42,
    votableStepId: 2,
    votesCountByStepId: {
      2: 5,
    },
  };

  const proposalWithoutVotableStep = {
    id: 42,
    votableStepId: null,
    votesCountByStepId: {},
  };

  it('should render a proposal page', () => {
    const wrapper = shallow(<ProposalPage {...props} proposal={proposalNoVotes} {...IntlData} />);

    const alert = wrapper.find('ProposalPageAlert');
    expect(alert).to.have.length(1);
    expect(alert.prop('proposal')).to.equal(proposalNoVotes);

    const header = wrapper.find('ProposalPageHeader');
    expect(header.props()).to.eql({
      proposal: proposalNoVotes,
      className: 'container container--custom',
      showThemes: true,
    });

    const tabContainer = wrapper.find(Tab.Container);
    expect(tabContainer).to.have.length(2);
    expect(tabContainer.first().props()).to.contains({
      id: 'proposal-page-tabs',
      defaultActiveKey: 'content',
      className: 'container--custom',
    });

    const tabsPills = tabContainer.first().find('div.tabs__pills');
    expect(tabsPills).to.have.length(1);
    expect(tabsPills.find('div.container')).to.have.length(1);
    const nav = tabsPills.find(Nav);
    expect(nav.prop('bsStyle')).to.equal('pills');
    expect(nav.prop('style')).to.deep.equal({ display: 'inline-block' });
    const navItems = nav.find(NavItem);
    expect(navItems).to.have.length(4);
    const contentItem = navItems.first();
    expect(contentItem.prop('eventKey')).to.equal('content');
    expect(contentItem.prop('className')).to.equal('tabs__pill');
    expect(contentItem.children().first().text()).to.equal('Présentation');
    const commentsItem = navItems.at(1);
    expect(commentsItem.prop('eventKey')).to.equal('comments');
    expect(commentsItem.prop('className')).to.equal('tabs__pill');
    expect(commentsItem.children().first().text()).to.equal('Discussions');
    expect(commentsItem.find('.badge').text()).to.equal(`${proposalNoVotes.comments_count}`);
    const voteButtonWrapper = tabsPills.find('Connect(ProposalVoteButtonWrapper)');
    expect(voteButtonWrapper).to.have.length(1);
    expect(voteButtonWrapper.props()).to.contains({
      proposal: proposalNoVotes,
      className: 'pull-right hidden-xs proposal__preview__vote',
    });
    expect(voteButtonWrapper.prop('style')).to.deep.equal({ marginTop: '10px' });
    const tabContent = tabContainer.first().find(Tab.Content);
    expect(tabContent).to.have.length(2);
    const tabPanes = tabContent.first().find(Tab.Pane);
    expect(tabPanes).to.have.length(4);
    const contentTabPane = tabPanes.first();
    expect(contentTabPane.prop('eventKey')).to.equal('content');
    const proposalContent = contentTabPane.find('Connect(ProposalPageContent)');
    expect(proposalContent).to.have.length(1);
    expect(proposalContent.props()).to.contains({
      proposal: proposalNoVotes,
      form: props.form,
      categories: props.categories,
    });
    const proposalMetadata = wrapper.find('ProposalPageMetadata');
    expect(proposalMetadata.props()).to.eql({
      proposal: proposalNoVotes,
      showDistricts: false,
      showCategories: false,
      showNullEstimation: false,
    });

    const proposalAdvancement = contentTabPane.find('ProposalPageAdvancement');

    expect(proposalAdvancement.props()).to.eql({ proposal: proposalNoVotes });
    const commentsTabPane = tabPanes.at(1);
    expect(commentsTabPane.props()).to.contains({ eventKey: 'comments' });

    const proposalComments = commentsTabPane.find('ProposalPageComments');
    expect(proposalComments.prop('form')).to.equal(props.form);
    expect(proposalComments.prop('id')).to.equal(proposalNoVotes.id);

    const proposalBlog = wrapper.find('Connect(ProposalPageBlog)');
    expect(proposalBlog.props()).to.eql({});
  });

  it('should render a vote tab and a vote modal if votable step is specified', () => {
    const wrapper = shallow(<ProposalPage {...props} proposal={proposalWithVotes} {...IntlData} />);
    const tabContainer = wrapper.find(Tab.Container);
    const tabsPills = tabContainer.find('div.tabs__pills');
    const nav = tabsPills.find(Nav);
    const navItems = nav.find(NavItem);
    expect(navItems).to.have.length(4);
    const votesItem = navItems.at(2);
    expect(votesItem.prop('eventKey')).to.equal('votes');
    expect(votesItem.prop('className')).to.equal('tabs__pill');
    expect(votesItem.children().first().text()).to.equal('Votes');
    expect(votesItem.find('.badge').text()).to.equal(`${proposalWithVotes.votesCountByStepId[2]}`);
    const tabContent = tabContainer.find(Tab.Content);
    const tabPanes = tabContent.find(Tab.Pane);
    expect(tabPanes).to.have.length(4);
    const votesTabPane = tabPanes.at(2);
    expect(votesTabPane.prop('eventKey')).to.equal('votes');
    const proposalVoteModal = tabContainer.find('Connect(ProposalVoteModal)');
    expect(proposalVoteModal).to.have.length(1);
    expect(proposalVoteModal.props()).to.eql({
      proposal: proposalWithVotes,
    });
  });

  it('should not render a vote modal if proposal has no votabledStep', () => {
    const wrapper = shallow(<ProposalPage {...props} proposal={proposalWithoutVotableStep} {...IntlData} />);
    const tabContainer = wrapper.find(Tab.Container);
    const proposalVoteModal = tabContainer.find('Connect(ProposalVoteModal)');
    expect(proposalVoteModal).to.have.length(0);
  });
});
