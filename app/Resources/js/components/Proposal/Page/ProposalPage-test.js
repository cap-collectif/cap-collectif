/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { Tab, Nav, NavItem } from 'react-bootstrap';
import { ProposalPage } from './ProposalPage';
import IntlData from '../../../translations/FR';
import {
  VOTE_TYPE_SIMPLE,
  VOTE_TYPE_DISABLED,
} from '../../../constants/ProposalConstants';

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
      { id: '1', voteType: VOTE_TYPE_DISABLED },
      { id: '2', voteType: VOTE_TYPE_SIMPLE },
    ],
  };

  const proposalNoVotes = {
    id: 41,
    referer: 'http://capco.test',
    votableStepId: '2',
    votesCountByStepId: {
      '2': 0,
    },
    comments_count: 5,
  };
  const proposalWithVotes = {
    id: 42,
    referer: 'http://capco.test',
    votableStepId: '2',
    votesCountByStepId: {
      '2': 5,
    },
  };

  const proposalWithoutVotableStep = {
    id: 42,
    referer: 'http://capco.test',
    votableStepId: null,
    votesCountByStepId: {},
  };

  it('should render a proposal page', () => {
    const wrapper = shallow(
      <ProposalPage {...props} proposal={proposalNoVotes} {...IntlData} />,
    );

    const alert = wrapper.find('ProposalPageAlert');
    expect(alert).toHaveLength(1);
    expect(alert.prop('proposal')).toEqual(proposalNoVotes);

    const header = wrapper.find('Connect(ProposalPageHeader)');
    expect(header.props()).toEqual({
      proposal: proposalNoVotes,
      className: 'container container--custom',
    });

    const tabContainer = wrapper.find(Tab.Container);
    expect(tabContainer).toHaveLength(2);
    expect(tabContainer.first().props()).toMatchObject({
      id: 'proposal-page-tabs',
      defaultActiveKey: 'content',
      className: 'container--custom',
    });

    const tabsPills = tabContainer.first().find('div.tabs__pills');
    expect(tabsPills).toHaveLength(1);
    expect(tabsPills.find('div.container')).toHaveLength(1);
    const nav = tabsPills.find(Nav);
    expect(nav.prop('bsStyle')).toEqual('pills');
    expect(nav.prop('style')).toEqual({ display: 'inline-block' });
    const navItems = nav.find(NavItem);
    expect(navItems).toHaveLength(4);
    const contentItem = navItems.first();
    expect(contentItem.prop('eventKey')).toEqual('content');
    expect(contentItem.prop('className')).toEqual('tabs__pill');
    expect(contentItem.children().first().text()).toEqual('Présentation');
    const commentsItem = navItems.at(1);
    expect(commentsItem.prop('eventKey')).toEqual('comments');
    expect(commentsItem.prop('className')).toEqual('tabs__pill');
    expect(commentsItem.children().first().text()).toEqual('Discussions');
    expect(commentsItem.find('.badge').text())
      .toEqual(`${proposalNoVotes.comments_count}`);
    const voteButtonWrapper = tabsPills.find(
      'Connect(ProposalVoteButtonWrapper)',
    );
    expect(voteButtonWrapper).toHaveLength(1);
    expect(voteButtonWrapper.props()).toMatchObject({
      proposal: proposalNoVotes,
      className: 'pull-right hidden-xs btn-lg',
    });
    expect(voteButtonWrapper.prop('style')).toEqual({ marginTop: '10px' });
    const tabContent = tabContainer.first().find(Tab.Content);
    expect(tabContent).toHaveLength(2);
    const tabPanes = tabContent.first().find(Tab.Pane);
    expect(tabPanes).toHaveLength(4);
    const contentTabPane = tabPanes.first();
    expect(contentTabPane.prop('eventKey')).toEqual('content');
    const proposalContent = contentTabPane.find('Connect(ProposalPageContent)');
    expect(proposalContent).toHaveLength(1);
    expect(proposalContent.props()).toMatchObject({
      proposal: proposalNoVotes,
      form: props.form,
      categories: props.categories,
    });
    const proposalMetadata = wrapper.find('ProposalPageMetadata');
    expect(proposalMetadata.props()).toEqual({
      proposal: proposalNoVotes,
      showDistricts: false,
      showCategories: false,
      showNullEstimation: false,
      showThemes: true,
    });

    const proposalAdvancement = contentTabPane.find('ProposalPageAdvancement');

    expect(proposalAdvancement.props()).toEqual({ proposal: proposalNoVotes });
    const commentsTabPane = tabPanes.at(1);
    expect(commentsTabPane.props()).toMatchObject({ eventKey: 'comments' });

    const proposalComments = commentsTabPane.find('ProposalPageComments');
    expect(proposalComments.prop('form')).toEqual(props.form);
    expect(proposalComments.prop('id')).toEqual(proposalNoVotes.id);

    const proposalBlog = wrapper.find('Connect(ProposalPageBlog)');
    expect(proposalBlog.props()).toEqual({});
  });

  it('should render a vote tab and a vote modal if votable step is specified', () => {
    const wrapper = shallow(
      <ProposalPage {...props} proposal={proposalWithVotes} {...IntlData} />,
    );
    const tabContainer = wrapper.find(Tab.Container);
    const tabsPills = tabContainer.find('div.tabs__pills');
    const nav = tabsPills.find(Nav);
    const navItems = nav.find(NavItem);
    expect(navItems).toHaveLength(4);
    const votesItem = navItems.at(2);
    expect(votesItem.prop('eventKey')).toEqual('votes');
    expect(votesItem.prop('className')).toEqual('tabs__pill');
    expect(votesItem.children().first().text()).toEqual('Votes');
    expect(votesItem.find('.badge').text())
      .toEqual(`${proposalWithVotes.votesCountByStepId[2]}`);
    const tabContent = tabContainer.find(Tab.Content);
    const tabPanes = tabContent.find(Tab.Pane);
    expect(tabPanes).toHaveLength(4);
    const votesTabPane = tabPanes.at(2);
    expect(votesTabPane.prop('eventKey')).toEqual('votes');
    const proposalVoteModal = tabContainer.find('Connect(ProposalVoteModal)');
    expect(proposalVoteModal).toHaveLength(1);
    expect(proposalVoteModal.props()).toEqual({
      proposal: proposalWithVotes,
    });
  });

  it('should not render a vote modal if proposal has no votabledStep', () => {
    const wrapper = shallow(
      <ProposalPage
        {...props}
        proposal={proposalWithoutVotableStep}
        {...IntlData}
      />,
    );
    const tabContainer = wrapper.find(Tab.Container);
    const proposalVoteModal = tabContainer.find('Connect(ProposalVoteModal)');
    expect(proposalVoteModal).toHaveLength(0);
  });
});
