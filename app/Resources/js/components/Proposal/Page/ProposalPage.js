// @flow
import React from 'react';
import { Row, Col, Tab, Nav, NavItem } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProposalPageHeader from './ProposalPageHeader';
import ProposalPageAlert from './ProposalPageAlert';
import ProposalDraftAlert from './ProposalDraftAlert';
import ProposalPageContent from './ProposalPageContent';
import ProposalPageLastNews from './ProposalPageLastNews';
import ProposalPageVotes from './ProposalPageVotes';
import ProposalPageBlog from './ProposalPageBlog';
import ProposalPageEvaluation from './ProposalPageEvaluation';
import ProposalVoteModal from '../Vote/ProposalVoteModal';
import ProposalPageMetadata from './ProposalPageMetadata';
import ProposalPageVoteThreshold from './ProposalPageVoteThreshold';
import ProposalPageAdvancement from './ProposalPageAdvancement';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import { scrollToAnchor } from '../../../services/ScrollToAnchor';
import ProposalFusionList from './ProposalFusionList';
import Loader from '../../Utils/Loader';
import type { FeatureToggles, State } from '../../../types';
import type { Proposal } from '../../../redux/modules/proposal';
import type ProposalPageQueryResponse from './__generated__/ProposalPageQuery.graphql';

type Props = {
  form: Object,
  proposal: Proposal,
  categories: Array<Object>,
  steps: Array<Object>,
  features: FeatureToggles,
};

export class ProposalPage extends React.Component<Props> {
  componentDidMount() {
    setTimeout(scrollToAnchor, 20); // We use setTimeout to interact with DOM in componentDidMount (see React documentation)
  }

  getHashKey(hash: string) {
    let key = null;
    if (hash.indexOf('content') !== -1) {
      key = 'content';
    }
    if (hash.indexOf('evaluation') !== -1) {
      key = 'evaluation';
    }
    if (hash.indexOf('comments') !== -1) {
      key = 'comments';
    }
    if (hash.indexOf('votes') !== -1) {
      key = 'votes';
    }
    return key;
  }

  getDefaultKey() {
    const hash = typeof window !== 'undefined' ? window.location.hash : null;
    if (hash) {
      return this.getHashKey(hash);
    }
    return 'content';
  }

  render() {
    const { proposal, form, categories, features, steps } = this.props;
    const currentVotableStep = proposal.votableStepId
      ? steps.filter(s => s.id === proposal.votableStepId)[0]
      : null;
    // $FlowFixMe
    const votesCount = Object.values(proposal.votesCountByStepId).reduce((a, b) => a + b, 0);
    const showVotesTab = votesCount > 0 || currentVotableStep !== null;
    const votableSteps = steps.filter(step => step.votable);
    return (
      <div>
        <ProposalDraftAlert proposal={proposal} />
        <ProposalPageAlert proposal={proposal} />
        <ProposalPageHeader proposal={proposal} className="container container--custom" />
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
                </Nav>
              </div>
            </div>
            <div className="container">
              <Tab.Content animation={false}>
                <Tab.Pane eventKey="content">
                  <Row>
                    <Col xs={12} sm={8}>
                      <ProposalFusionList proposal={proposal} type="From" />
                      <ProposalFusionList proposal={proposal} type="Into" />
                      <ProposalPageLastNews proposal={proposal} />
                      <ProposalPageContent
                        proposal={proposal}
                        form={form}
                        categories={categories}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <ProposalPageMetadata
                        proposal={proposal}
                        showDistricts={features.districts}
                        showCategories={form.usingCategories}
                        showNullEstimation={
                          !!(currentVotableStep && currentVotableStep.voteType === VOTE_TYPE_BUDGET)
                        }
                        showThemes={features.themes && form.usingThemes}
                      />
                      <br />
                      {currentVotableStep &&
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
                </Tab.Pane>
                {showVotesTab && (
                  <Tab.Pane eventKey="votes">
                    <Tab.Container id="tab-votesByStep" defaultActiveKey={0}>
                      <Row className="clearfix">
                        <Nav bsStyle="pills">
                          {votableSteps.map((step, index) => (
                            <NavItem key={index} eventKey={index}>
                              {step.title}{' '}
                              <span className="badge">{proposal.votesCountByStepId[step.id]}</span>
                            </NavItem>
                          ))}
                        </Nav>
                        <Tab.Content animation={false}>
                          {votableSteps.map((step, index) => (
                            <Tab.Pane key={index} eventKey={index}>
                              <ProposalPageVotes stepId={step.id} proposal={proposal} />
                            </Tab.Pane>
                          ))}
                        </Tab.Content>
                      </Row>
                    </Tab.Container>
                  </Tab.Pane>
                )}
                <Tab.Pane eventKey="blog">
                  <ProposalPageBlog />
                </Tab.Pane>
                <Tab.Pane eventKey="evaluation">
                  <QueryRenderer
                    environment={environment}
                    query={graphql`
                      query ProposalPageQuery($proposalId: ID!) {
                        proposal(id: $proposalId) {
                          ...ProposalPageEvaluation_proposal
                        }
                      }
                    `}
                    variables={{ proposalId: proposal.id }}
                    render={({
                      error,
                      props,
                    }: {
                      error: ?Error,
                      props?: ProposalPageQueryResponse,
                    }) => {
                      if (error) {
                        console.log(error); // eslint-disable-line no-console
                        return graphqlError;
                      }
                      if (props) {
                        // eslint-disable-next-line react/prop-types
                        if (props.proposal) {
                          return <ProposalPageEvaluation proposal={props.proposal} />;
                        }
                        return graphqlError;
                      }
                      return <Loader />;
                    }}
                  />
                </Tab.Pane>
              </Tab.Content>
            </div>
            {!proposal.isDraft && currentVotableStep && <ProposalVoteModal proposal={proposal} />}
          </div>
        </Tab.Container>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => {
  return {
    features: state.default.features,
    proposal:
      state.proposal.currentProposalId &&
      state.proposal.proposalsById[state.proposal.currentProposalId],
    steps:
      state.project.currentProjectById &&
      state.project.projectsById[state.project.currentProjectById].steps,
  };
};

export default connect(mapStateToProps)(ProposalPage);
