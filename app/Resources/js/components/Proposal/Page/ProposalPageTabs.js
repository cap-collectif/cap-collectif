// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Row, Col, Tab, Nav, NavItem } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import type { ProposalPageTabs_proposal } from './__generated__/ProposalPageTabs_proposal.graphql';
import ProposalPageContent from './ProposalPageContent';
import ProposalPageLastNews from './ProposalPageLastNews';
import ProposalVotesByStep from './ProposalVotesByStep';
import ProposalPageFollowers from './ProposalPageFollowers';
import ProposalPageBlog from './ProposalPageBlog';
import ProposalPageEvaluation from './ProposalPageEvaluation';
import ProposalVoteModal from '../Vote/ProposalVoteModal';
import ProposalPageMetadata from './ProposalPageMetadata';
import ProposalPageVoteThreshold from './ProposalPageVoteThreshold';
import ProposalPageAdvancement from './ProposalPageAdvancement';
import ProposalFusionList from './ProposalFusionList';
import type { FeatureToggles } from '../../../types';
import type { Proposal } from '../../../redux/modules/proposal';

type Props = {
  proposal: ProposalPageTabs_proposal,
  form: Object,
  oldProposal: Proposal,
  categories: Array<Object>,
  steps: Array<Object>,
  features: FeatureToggles,
};

export class ProposalPageTabs extends React.Component<Props> {
  getHashKey(hash: string) {
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
  }

  getDefaultKey() {
    const hash = typeof window !== 'undefined' ? window.location.hash : null;
    if (hash) {
      return this.getHashKey(hash);
    }
    return 'content';
  }
  render() {
    const { proposal, oldProposal, form, steps, features, categories } = this.props;
    const currentVotableStep = proposal.currentVotableStep;

    // $FlowFixMe
    const votesCount = Object.values(oldProposal.votesCountByStepId).reduce(
      (a, b) => parseInt(a, 10) + parseInt(b, 10),
      0,
    );

    const showVotesTab = votesCount > 0 || currentVotableStep !== null;
    const votableSteps = steps.filter(step => step.votable);
    const isPageAdmin = false;
    return (
      <Tab.Container
        id="proposal-page-tabs"
        defaultActiveKey={this.getDefaultKey()}
        className="tabs__container container--custom">
        <div>
          <div className="tabs">
            <div className="container">
              <Nav bsStyle="tabs">
                <NavItem eventKey="content" className="tab">
                  <FormattedMessage id="proposal.tabs.content" />
                </NavItem>
                <NavItem eventKey="blog" className="tab">
                  <FormattedMessage id="proposal.tabs.blog" />
                  <span className="badge">{proposal.postsCount}</span>
                </NavItem>
                {proposal.viewerCanSeeEvaluation && (
                  <NavItem eventKey="evaluation" className="tab">
                    <FormattedMessage id="proposal.tabs.evaluation" />
                  </NavItem>
                )}
                {showVotesTab && (
                  <NavItem eventKey="votes" className="tab">
                    <FormattedMessage id="proposal.tabs.votes" />
                    <span className="badge">{votesCount}</span>
                  </NavItem>
                )}
                <NavItem eventKey="followers" className="tab">
                  <FormattedMessage id="proposal.tabs.followers" />
                  <span className="badge">{proposal.followerConnection.totalCount}</span>
                </NavItem>
              </Nav>
            </div>
          </div>
          <div className="container">
            <Tab.Content animation={false}>
              <Tab.Pane eventKey="content">
                <Row>
                  <Col xs={12} sm={8}>
                    {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
                    <ProposalFusionList proposal={proposal} />
                    {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
                    <ProposalPageLastNews proposal={proposal} />
                    <ProposalPageContent
                      proposal={oldProposal}
                      form={form}
                      categories={categories}
                    />
                  </Col>
                  <Col xs={12} sm={4}>
                    {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
                    <ProposalPageMetadata
                      proposal={proposal}
                      showDistricts={features.districts}
                      showCategories={form.usingCategories}
                      showNullEstimation={
                        !!(currentVotableStep && currentVotableStep.voteType === 'BUDGET')
                      }
                      showThemes={features.themes && form.usingThemes}
                    />
                    <br />
                    {currentVotableStep !== null &&
                      typeof currentVotableStep !== 'undefined' &&
                      currentVotableStep.voteThreshold !== null &&
                      typeof currentVotableStep.voteThreshold !== 'undefined' &&
                      currentVotableStep.voteThreshold > 0 && (
                        <span>
                          {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
                          <ProposalPageVoteThreshold
                            proposal={oldProposal}
                            step={currentVotableStep}
                          />
                          <br />
                        </span>
                      )}
                    <ProposalPageAdvancement proposal={oldProposal} />
                  </Col>
                </Row>
              </Tab.Pane>
              {showVotesTab && (
                <Tab.Pane eventKey="votes">
                  <Tab.Container id="tab-votesByStep" defaultActiveKey={0}>
                    <Row className="clearfix">
                      <Nav bsStyle="pills">
                        {votableSteps.map((step, index) => (
                          <NavItem key={index} eventKey={index}>
                            {step.title}{' '}
                            <span className="badge">{oldProposal.votesCountByStepId[step.id]}</span>
                          </NavItem>
                        ))}
                      </Nav>
                      <Tab.Content animation={false}>
                        {votableSteps.map((step, index) => (
                          <Tab.Pane key={index} eventKey={index}>
                            <ProposalVotesByStep stepId={step.id} proposal={oldProposal} />
                          </Tab.Pane>
                        ))}
                      </Tab.Content>
                    </Row>
                  </Tab.Container>
                </Tab.Pane>
              )}
              <Tab.Pane eventKey="blog">
                {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
                <ProposalPageBlog proposal={proposal} />
              </Tab.Pane>
              <Tab.Pane eventKey="evaluation">
                {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
                <ProposalPageEvaluation proposal={proposal} />
              </Tab.Pane>
              <Tab.Pane eventKey="followers">
                {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
                <ProposalPageFollowers proposal={proposal} pageAdmin={isPageAdmin} />
              </Tab.Pane>
            </Tab.Content>
          </div>
          {!oldProposal.isDraft &&
            currentVotableStep && (
              <ProposalVoteModal proposal={proposal} step={currentVotableStep} />
            )}
        </div>
      </Tab.Container>
    );
  }
}

export default createFragmentContainer(
  ProposalPageTabs,
  graphql`
    fragment ProposalPageTabs_proposal on Proposal {
      ...ProposalPageFollowers_proposal
      ...ProposalPageEvaluation_proposal
      ...ProposalFusionList_proposal
      ...ProposalPageMetadata_proposal
      ...ProposalPageLastNews_proposal
      ...ProposalPageBlog_proposal
      postsCount
      currentVotableStep {
        id
        ... on CollectStep {
          voteThreshold
          voteType
        }
        ... on SelectionStep {
          voteThreshold
          voteType
        }
        ...ProposalPageVoteThreshold_step
      }
      viewerCanSeeEvaluation
      followerConnection(first: $count, after: $cursor) {
        totalCount
      }
    }
  `,
);
