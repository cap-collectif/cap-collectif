/* eslint-env mocha */
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
    votes: [],
    features: {
      themes: true,
      districts: false,
    },
  };

  const proposalNoVotes = {
    id: 41,
    votesCount: 0,
    comments_count: 5,
  };
  const proposalWithVotes = {
    id: 42,
    votesCount: 5,
  };

  const votableStepDisabled = { id: 1, voteType: VOTE_TYPE_DISABLED };
  const votableStepSimple = { id: 2, voteType: VOTE_TYPE_SIMPLE };

  const state = {
    userHasVote: true,
    creditsLeft: null,
    showVotesModal: false,
  };

  it('should render a proposal page', () => {
    const wrapper = shallow(<ProposalPage {...props} proposal={proposalNoVotes} {...IntlData} />);
    const newState = {
      proposal: proposalNoVotes,
      ...state,
    };
    wrapper.setState(newState);
    const alert = wrapper.find('ProposalPageAlert');
    expect(alert).to.have.length(1);
    expect(alert.prop('proposal')).to.equal(proposalNoVotes);
    const header = wrapper.find('ProposalPageHeader');
    expect(header.prop('proposal')).to.equal(proposalNoVotes);
    expect(header.prop('className')).to.equal('container container--custom');
    expect(header.prop('showThemes')).to.equal(true);
    expect(header.prop('userHasVote')).to.equal(state.userHasVote);
    expect(header.prop('onVote')).to.be.a('function');
    expect(header.prop('selectionStep')).to.equal(null);
    expect(header.prop('creditsLeft')).to.equal(state.creditsLeft);
    const tabContainer = wrapper.find(Tab.Container);
    expect(tabContainer).to.have.length(1);
    expect(tabContainer.prop('id')).to.equal('proposal-page-tabs');
    expect(tabContainer.prop('defaultActiveKey')).to.equal('content');
    expect(tabContainer.prop('className')).to.equal('container--custom');
    const tabsPills = tabContainer.find('div.tabs__pills');
    expect(tabsPills).to.have.length(1);
    expect(tabsPills.find('div.container')).to.have.length(1);
    const nav = tabsPills.find(Nav);
    expect(nav.prop('bsStyle')).to.equal('pills');
    expect(nav.prop('style')).to.deep.equal({ display: 'inline-block' });
    const navItems = nav.find(NavItem);
    expect(navItems).to.have.length(2);
    const contentItem = navItems.first();
    expect(contentItem.prop('eventKey')).to.equal('content');
    expect(contentItem.prop('className')).to.equal('tabs__pill');
    expect(contentItem.children().first().text()).to.equal('Présentation');
    const commentsItem = navItems.last();
    expect(commentsItem.prop('eventKey')).to.equal('comments');
    expect(commentsItem.prop('className')).to.equal('tabs__pill');
    expect(commentsItem.children().first().text()).to.equal('Commentaires');
    expect(commentsItem.find('.badge').text()).to.equal('' + proposalNoVotes.comments_count);
    const voteButtonWrapper = tabsPills.find('Connect(ProposalVoteButtonWrapper)');
    expect(voteButtonWrapper).to.have.length(1);
    expect(voteButtonWrapper.prop('selectionStep')).to.equal(null);
    expect(voteButtonWrapper.prop('proposal')).to.equal(proposalNoVotes);
    expect(voteButtonWrapper.prop('creditsLeft')).to.equal(state.creditsLeft);
    expect(voteButtonWrapper.prop('userHasVote')).to.equal(state.userHasVote);
    expect(voteButtonWrapper.prop('onClick')).to.be.a('function');
    expect(voteButtonWrapper.prop('style')).to.deep.equal({ marginTop: '10px' });
    expect(voteButtonWrapper.prop('className')).to.equal('pull-right hidden-xs');
    const tabContent = tabContainer.find(Tab.Content);
    expect(tabContent).to.have.length(1);
    const tabPanes = tabContent.find(Tab.Pane);
    expect(tabPanes).to.have.length(2);
    const contentTabPane = tabPanes.first();
    expect(contentTabPane.prop('eventKey')).to.equal('content');
    const proposalContent = contentTabPane.find('ProposalPageContent');
    expect(proposalContent).to.have.length(1);
    expect(proposalContent.prop('proposal')).to.equal(proposalNoVotes);
    expect(proposalContent.prop('form')).to.equal(props.form);
    expect(proposalContent.prop('themes')).to.equal(props.themes);
    expect(proposalContent.prop('districts')).to.equal(props.districts);
    expect(proposalContent.prop('categories')).to.equal(props.categories);
    expect(proposalContent.prop('userHasVote')).to.equal(state.userHasVote);
    expect(proposalContent.prop('selectionStep')).to.equal(null);
    expect(proposalContent.prop('creditsLeft')).to.equal(state.creditsLeft);
    expect(proposalContent.prop('onVote')).to.be.a('function');
    const proposalMetadata = contentTabPane.find('ProposalPageMetadata');
    expect(proposalMetadata).to.have.length(1);
    expect(proposalMetadata.prop('proposal')).to.equal(proposalNoVotes);
    expect(proposalMetadata.prop('showDistricts')).to.equal(false);
    expect(proposalMetadata.prop('showCategories')).to.equal(false);
    expect(proposalMetadata.prop('showNullEstimation')).to.equal(false);
    const commentsTabPane = tabPanes.last();
    expect(commentsTabPane.prop('eventKey')).to.equal('comments');
    const proposalComments = commentsTabPane.find('ProposalPageComments');
    expect(proposalComments).to.have.length(1);
    expect(proposalComments.prop('form')).to.equal(props.form);
    expect(proposalComments.prop('id')).to.equal(proposalNoVotes.id);
  });

  it('should render a vote tab and a vote modal if votable step is specified', () => {
    const wrapper = shallow(<ProposalPage {...props} proposal={proposalWithVotes} votableStep={votableStepSimple} {...IntlData} />);
    const newState = {
      proposal: proposalWithVotes,
      ...state,
    };
    wrapper.setState(newState);
    const tabContainer = wrapper.find(Tab.Container);
    const tabsPills = tabContainer.find('div.tabs__pills');
    const nav = tabsPills.find(Nav);
    const navItems = nav.find(NavItem);
    expect(navItems).to.have.length(3);
    const votesItem = navItems.last();
    expect(votesItem.prop('eventKey')).to.equal('votes');
    expect(votesItem.prop('className')).to.equal('tabs__pill');
    expect(votesItem.children().first().text()).to.equal('Votes');
    expect(votesItem.find('.badge').text()).to.equal('' + proposalWithVotes.votesCount);
    const tabContent = tabContainer.find(Tab.Content);
    const tabPanes = tabContent.find(Tab.Pane);
    expect(tabPanes).to.have.length(3);
    const votesTabPane = tabPanes.last();
    expect(votesTabPane.prop('eventKey')).to.equal('votes');
    const proposalPageVotes = votesTabPane.find('ProposalPageVotes');
    expect(proposalPageVotes).to.have.length(1);
    expect(proposalPageVotes.prop('proposal')).to.equal(proposalWithVotes);
    expect(proposalPageVotes.prop('votes')).to.equal(props.votes);
    const proposalVoteModal = tabContainer.find('Connect(ProposalVoteModal)');
    expect(proposalVoteModal).to.have.length(1);
    expect(proposalVoteModal.prop('proposal')).to.equal(proposalWithVotes);
    expect(proposalVoteModal.prop('selectionStep')).to.equal(votableStepSimple);
    expect(proposalVoteModal.prop('showModal')).to.equal(false);
    expect(proposalVoteModal.prop('onToggleModal')).to.be.a('function');
  });

  it('should not render a vote tab if proposal has no votes and selection step is not specified', () => {
    const wrapper = shallow(<ProposalPage {...props} proposal={proposalNoVotes} {...IntlData} />);
    const newState = {
      proposal: proposalNoVotes,
      ...state,
    };
    wrapper.setState(newState);
    const tabContainer = wrapper.find(Tab.Container);
    const tabsPills = tabContainer.find('div.tabs__pills');
    const nav = tabsPills.find(Nav);
    const navItems = nav.find(NavItem);
    expect(navItems).to.have.length(2);
    const tabContent = tabContainer.find(Tab.Content);
    const tabPanes = tabContent.find(Tab.Pane);
    expect(tabPanes).to.have.length(2);
    const proposalVoteModal = tabContainer.find('Connect(ProposalVoteModal)');
    expect(proposalVoteModal).to.have.length(0);
  });

  it('should not render a vote modal if selection step is not specified', () => {
    const wrapper = shallow(<ProposalPage {...props} proposal={proposalWithVotes} {...IntlData} />);
    const newState = {
      proposal: proposalWithVotes,
      ...state,
    };
    wrapper.setState(newState);
    const tabContainer = wrapper.find(Tab.Container);
    const proposalVoteModal = tabContainer.find('Connect(ProposalVoteModal)');
    expect(proposalVoteModal).to.have.length(0);
  });

  it('should not render a vote modal if selection step\'s vote type is disabled', () => {
    const wrapper = shallow(<ProposalPage {...props} proposal={proposalWithVotes} votableStep={votableStepDisabled} {...IntlData} />);
    const newState = {
      proposal: proposalWithVotes,
      ...state,
    };
    wrapper.setState(newState);
    const tabContainer = wrapper.find(Tab.Container);
    const proposalVoteModal = tabContainer.find('Connect(ProposalVoteModal)');
    expect(proposalVoteModal).to.have.length(0);
  });
});
