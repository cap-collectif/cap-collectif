import React, { PropTypes } from 'react';
import { Row, Col, Tab, Nav, NavItem } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import ProposalPageHeader from './ProposalPageHeader';
import ProposalPageAlert from './ProposalPageAlert';
import ProposalPageContent from './ProposalPageContent';
import ProposalPageAnswer from './ProposalPageAnswer';
import ProposalPageVotes from './ProposalPageVotes';
import ProposalPageBlog from './ProposalPageBlog';
import ProposalPageComments from './ProposalPageComments';
import ProposalVoteModal from '../Vote/ProposalVoteModal';
import ProposalPageMetadata from './ProposalPageMetadata';
import ProposalPageVoteThreshold from './ProposalPageVoteThreshold';
import ProposalPageAdvancement from './ProposalPageAdvancement';
import ProposalVoteButtonWrapper from '../Vote/ProposalVoteButtonWrapper';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import { connect } from 'react-redux';
import { scrollToAnchor } from '../../../services/ScrollToAnchor';

export const ProposalPage = React.createClass({
  propTypes: {
    form: PropTypes.object.isRequired,
    proposal: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    steps: PropTypes.array.isRequired,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  componentDidMount() {
    setTimeout(scrollToAnchor, 20); // We use setTimeout to interact with DOM in componentDidMount (see React documentation)
  },

  getHashKey(hash) {
    let key = null;
    if (hash.indexOf('content') !== -1) {
      key = 'content';
    }
    if (hash.indexOf('comments') !== -1) {
      key = 'comments';
    }
    if (hash.indexOf('votes') !== -1) {
      key = 'votes';
    }
    return key;
  },

  getDefaultKey() {
    const hash = typeof window !== 'undefined' ? window.location.hash : null;
    if (hash) {
      return this.getHashKey(hash);
    }
    return 'content';
  },

  render() {
    const { proposal, form, categories, features, steps } = this.props;
    const votableStep = proposal.votableStepId ? steps[proposal.votableStepId].votable : null;
    const showVotesTab = proposal.votesCount > 0 || votableStep !== null;
    const votableSteps = steps.filter(step => step.votable && (step.type === 'selection' || step.type === 'collect'));
    return (
        <div>
          <ProposalPageAlert proposal={proposal} />
          <ProposalPageHeader
              proposal={proposal}
              className="container container--custom"
              showThemes={features.themes && form.usingThemes}
          />
          <Tab.Container
              id="proposal-page-tabs"
              defaultActiveKey={this.getDefaultKey()}
              className="container--custom"
          >
            <div>
              <div className="tabs__pills">
                <div className="container">
                  <Nav bsStyle="pills" style={{ display: 'inline-block' }}>
                    <NavItem eventKey="content" className="tabs__pill">
                      {this.getIntlMessage('proposal.tabs.content')}
                    </NavItem>
                    <NavItem eventKey="comments" className="tabs__pill">
                      {this.getIntlMessage('proposal.tabs.comments')}
                      <span className="badge">{proposal.comments_count}</span>
                    </NavItem>
                    {
                      showVotesTab
                      && <NavItem eventKey="votes" className="tabs__pill">
                        {this.getIntlMessage('proposal.tabs.votes')}
                        <span className="badge">{Object.values(proposal.votesCountByStepId).reduce((a, b = 0) => a + b)}</span>
                      </NavItem>
                    }
                    <NavItem eventKey="blog" className="tabs__pill">
                      {this.getIntlMessage('proposal.tabs.blog')}
                      <span className="badge">{proposal.postsCount}</span>
                    </NavItem>
                  </Nav>
                  <ProposalVoteButtonWrapper
                      proposal={proposal}
                      style={{ marginTop: '10px' }}
                      className="pull-right hidden-xs"
                  />
                </div>
              </div>
              <div className="container">
                <Tab.Content animation={false}>
                  <Tab.Pane eventKey="content">
                    <Row>
                      <Col xs={12} sm={8}>
                        <ProposalPageAnswer
                            answer={proposal.answer}
                        />
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
                            showNullEstimation={votableStep && votableStep.voteType === VOTE_TYPE_BUDGET}
                        />
                        <br />
                        {
                          votableStep && votableStep.voteThreshold > 0 &&
                            <span>
                              <ProposalPageVoteThreshold
                                proposal={proposal}
                                step={votableStep}
                              />
                              <br />
                            </span>
                        }
                        <ProposalPageAdvancement
                            proposal={proposal}
                        />
                      </Col>
                    </Row>
                  </Tab.Pane>
                  <Tab.Pane eventKey="comments">
                    <ProposalPageComments
                        id={proposal.id}
                        form={form}
                    />
                    <Col xs={12} sm={4}>
                      <ProposalPageMetadata
                        proposal={proposal}
                        showDistricts={features.districts}
                        showCategories={form.usingCategories}
                        showNullEstimation={!!votableStep && votableStep.voteType === VOTE_TYPE_BUDGET}
                      />
                      <br />
                      {
                        votableStep && votableStep.voteType === VOTE_TYPE_SIMPLE && votableStep.voteThreshold > 0 &&
                        <span>
                          <ProposalPageVoteThreshold proposal={proposal} step={votableStep} /><br />
                        </span>
                      }
                      <ProposalPageAdvancement
                        proposal={proposal}
                      />
                    </Col>
                </Tab.Pane>
                <Tab.Pane eventKey="comments">
                  <ProposalPageComments
                    form={form}
                    id={proposal.id}
                  />
                </Tab.Pane>
                  {
                    showVotesTab
                    && <Tab.Pane eventKey="votes">
                        <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                          <Row className="clearfix">
                            <Nav bsStyle="pills">
                              {
                                votableSteps.map((step, index) =>
                                  <NavItem
                                    key={index}
                                    eventKey={step.id}
                                  >
                                    {step.title} <span className="badge">{proposal.votesCountByStepId[step.id] || 0}</span>
                                  </NavItem>
                                )
                              }
                            </Nav>
                            <Tab.Content animation={false}>
                              {
                                votableSteps.map((step, index) =>
                                    <Tab.Pane key={index} eventKey={step.id}>
                                      <ProposalPageVotes
                                        stepId={step.id}
                                        proposal={proposal}
                                      />
                                    </Tab.Pane>
                                )
                              }
                            </Tab.Content>
                          </Row>
                        </Tab.Container>
                      </Tab.Pane>
                  }
                  <Tab.Pane eventKey="blog">
                    <ProposalPageBlog />
                  </Tab.Pane>
                </Tab.Content>
              </div>
              {
                votableStep != null &&
                  <ProposalVoteModal
                      proposal={proposal}
                  />
              }
            </div>
          </Tab.Container>
        </div>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    features: state.default.features,
    proposal: state.proposal.proposals[state.proposal.currentProposalById],
    steps: state.project.projects[state.project.currentProjectById].steps,
  };
};

export default connect(mapStateToProps)(ProposalPage);
