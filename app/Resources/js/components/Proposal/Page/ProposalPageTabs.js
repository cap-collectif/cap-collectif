// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Row, Col, Tab, Nav, NavItem } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import type { ProposalPageTabs_proposal } from '~relay/ProposalPageTabs_proposal.graphql';
import type { ProposalPageTabs_viewer } from '~relay/ProposalPageTabs_viewer.graphql';
import type { ProposalPageTabs_step } from '~relay/ProposalPageTabs_step.graphql';
import ProposalPageContent from './ProposalPageContent';
import ProposalPageLastNews from './ProposalPageLastNews';
import ProposalVotesByStep from './ProposalVotesByStep';
import ProposalPageFollowers from './ProposalPageFollowers';
import ProposalPageBlog from './ProposalPageBlog';
import ProposalPageEvaluation from './ProposalPageEvaluation';
import ProposalPageMetadata from './ProposalPageMetadata';
import ProposalPageVoteThreshold from './ProposalPageVoteThreshold';
import ProposalPageAdvancement from './ProposalPageAdvancement';
import ProposalFusionList from './ProposalFusionList';
import type { FeatureToggles } from '../../../types';
import TrashedMessage from '../../Trashed/TrashedMessage';

type Props = {
  viewer: ?ProposalPageTabs_viewer,
  step: ?ProposalPageTabs_step,
  proposal: ProposalPageTabs_proposal,
  features: FeatureToggles,
};

type State = {
  tabKey: string,
};

const getHashKey = (hash: string) => {
  if (hash.indexOf('content') !== -1) {
    return 'content';
  }
  if (hash.indexOf('evaluation') !== -1) {
    return 'evaluation';
  }
  if (hash.indexOf('comments') !== -1) {
    return 'comments';
  }
  if (hash.indexOf('votes') !== -1) {
    return 'votes';
  }
  if (hash.indexOf('followers') !== -1) {
    return 'followers';
  }
  return 'content';
};

export class ProposalPageTabs extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      tabKey: 'content',
    };
  }

  getDefaultKey() {
    const hash = typeof window !== 'undefined' ? window.location.hash : null;
    if (hash) {
      return getHashKey(hash);
    }
    return 'content';
  }

  render() {
    const { viewer, proposal, step, features } = this.props;
    const { tabKey } = this.state;
    const { currentVotableStep, project } = proposal;
    const votesCount = proposal.allVotes.totalCount;
    const showVotesTab = votesCount > 0 || currentVotableStep !== null;
    const showFollowersTab = project && project.opinionCanBeFollowed;
    return (
      <Tab.Container
        id="proposal-page-tabs"
        activeKey={tabKey}
        onSelect={key => this.setState({ tabKey: key })}
        className="tabs__container">
        <div>
          <div className="tabs">
            <div className="container">
              <Nav bsStyle="tabs">
                <NavItem eventKey="content" className="tab">
                  <FormattedMessage id="presentation_step" />
                </NavItem>
                {proposal.news.totalCount > 0 && (
                  <NavItem eventKey="blog" className="tab">
                    <FormattedMessage id='menu.news' />
                    <span className="badge">{proposal.news.totalCount}</span>
                  </NavItem>
                )}
                {proposal.viewerCanSeeEvaluation && (
                  <NavItem eventKey="evaluation" className="tab">
                    <FormattedMessage id='proposal.tabs.evaluation' />
                  </NavItem>
                )}
                {showVotesTab && (
                  <NavItem eventKey="votes" className="tab">
                    <FormattedMessage id='global.vote' />
                    <span className="badge">{votesCount}</span>
                  </NavItem>
                )}
                {showFollowersTab && (
                  <NavItem eventKey="followers" className="tab">
                    <FormattedMessage id="proposal.tabs.followers" />
                    <span className="badge">
                      {proposal.allFollowers ? proposal.allFollowers.totalCount : 0}
                    </span>
                  </NavItem>
                )}
              </Nav>
            </div>
          </div>
          <div className="container">
            <Tab.Content animation={false}>
              <Tab.Pane eventKey="content">
                <TrashedMessage contribution={proposal}>
                  <Row>
                    <Col xs={12} sm={8}>
                      <ProposalFusionList proposal={proposal} />
                      {proposal && proposal.news && proposal.news.totalCount > 0 && (
                        <ProposalPageLastNews proposal={proposal} />
                      )}
                      <ProposalPageContent proposal={proposal} step={step} viewer={viewer} />
                    </Col>
                    <Col xs={12} sm={4}>
                      <ProposalPageMetadata
                        proposal={proposal}
                        showDistricts={features.districts || false}
                        showCategories={proposal && proposal.form.usingCategories}
                        showNullEstimation={
                          !!(currentVotableStep && currentVotableStep.voteType === 'BUDGET')
                        }
                        showThemes={
                          (features.themes || false) && (proposal && proposal.form.usingThemes)
                        }
                      />
                      <br />
                      {currentVotableStep !== null &&
                        typeof currentVotableStep !== 'undefined' &&
                        currentVotableStep.voteThreshold !== null &&
                        typeof currentVotableStep.voteThreshold !== 'undefined' &&
                        currentVotableStep.voteThreshold > 0 && (
                          <span>
                            <ProposalPageVoteThreshold
                              proposal={proposal}
                              step={currentVotableStep}
                            />
                            <br />
                          </span>
                        )}
                      <ProposalPageAdvancement proposal={proposal} />
                    </Col>
                  </Row>
                </TrashedMessage>
              </Tab.Pane>
              {showVotesTab && tabKey === 'votes' && (
                <Tab.Pane eventKey="votes">
                  <Tab.Container id="tab-votesByStep" defaultActiveKey={0}>
                    <Row className="clearfix">
                      <Nav bsStyle="pills" className="mb-20">
                        {proposal.votableSteps.map((votableStep, index) => (
                          <NavItem key={index} eventKey={index}>
                            {votableStep.title}
                          </NavItem>
                        ))}
                      </Nav>
                      <Tab.Content animation={false}>
                        {proposal.votableSteps.map((votableStep, index) => (
                          <Tab.Pane key={index} eventKey={index}>
                            <ProposalVotesByStep stepId={votableStep.id} proposal={proposal} />
                          </Tab.Pane>
                        ))}
                      </Tab.Content>
                    </Row>
                  </Tab.Container>
                </Tab.Pane>
              )}
              {proposal.news.totalCount > 0 && (
                <Tab.Pane eventKey="blog">
                  <ProposalPageBlog proposal={proposal} />
                </Tab.Pane>
              )}
              <Tab.Pane eventKey="evaluation">
                <ProposalPageEvaluation proposal={proposal} />
              </Tab.Pane>
              <Tab.Pane eventKey="followers">
                <ProposalPageFollowers proposal={proposal} pageAdmin={false} />
              </Tab.Pane>
            </Tab.Content>
          </div>
        </div>
      </Tab.Container>
    );
  }
}

export default createFragmentContainer(ProposalPageTabs, {
  step: graphql`
    fragment ProposalPageTabs_step on ProposalStep {
      ...ProposalPageContent_step
    }
  `,
  viewer: graphql`
    fragment ProposalPageTabs_viewer on User {
      ...ProposalPageContent_viewer @arguments(hasVotableStep: $hasVotableStep)
    }
  `,
  proposal: graphql`
    fragment ProposalPageTabs_proposal on Proposal {
      id
      ...ProposalPageFollowers_proposal
      ...ProposalPageEvaluation_proposal
      ...ProposalFusionList_proposal
      ...ProposalPageMetadata_proposal
      ...ProposalPageLastNews_proposal
      ...ProposalPageBlog_proposal
      ...ProposalPageContent_proposal
      ...ProposalPageAdvancement_proposal
      ...ProposalPageVoteThreshold_proposal
      ...TrashedMessage_contribution
      allVotes: votes(first: 0) {
        totalCount
      }
      form {
        usingCategories
        usingThemes
      }
      news {
        totalCount
      }
      currentVotableStep {
        ...ProposalPageVoteThreshold_step
        id
        voteThreshold
        voteType
      }
      votableSteps {
        id
        title
      }
      viewerCanSeeEvaluation
      allFollowers: followers(first: 0) {
        totalCount
      }
      project {
        opinionCanBeFollowed
      }
    }
  `,
});
