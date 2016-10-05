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
import { VOTE_TYPE_DISABLED, VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import ProposalStore from '../../../stores/ProposalStore';
import ProposalVoteStore from '../../../stores/ProposalVoteStore';
import ProposalActions from '../../../actions/ProposalActions';
import { connect } from 'react-redux';
import { scrollToAnchor } from '../../../services/ScrollToAnchor';

export const ProposalPage = React.createClass({
  propTypes: {
    form: PropTypes.object.isRequired,
    proposal: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    votableStep: PropTypes.object,
    userHasVote: PropTypes.bool,
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      votableStep: null,
      userHasVote: false,
      creditsLeft: null,
      user: null,
    };
  },

  getInitialState() {
    const {
      proposal,
      userHasVote,
      votableStep,
    } = this.props;
    if (votableStep) {
      ProposalActions.initProposalVotes(votableStep.creditsLeft, !!userHasVote);
    }
    ProposalActions.initProposal(proposal);
    return {
      proposal,
      userHasVote: !!userHasVote,
      creditsLeft: ProposalVoteStore.creditsLeft,
      showVotesModal: false,
    };
  },

  componentWillMount() {
    ProposalStore.addChangeListener(this.onChange);
    ProposalVoteStore.addChangeListener(this.onVoteChange);
  },

  componentDidMount() {
    setTimeout(scrollToAnchor, 20); // We use setTimeout to interact with DOM in componentDidMount (see React documentation)
  },

  componentWillUnmount() {
    ProposalStore.removeChangeListener(this.onChange);
    ProposalVoteStore.removeChangeListener(this.onVoteChange);
  },

  onChange() {
    if (ProposalStore.isProposalSync) {
      this.setState({
        proposal: ProposalStore.proposal,
      });
      return;
    }
    this.loadProposal();
  },

  onVoteChange() {
    const { user } = this.props;
    if (user) {
      this.setState({
        userHasVote: ProposalVoteStore.userHasVote,
        creditsLeft: ProposalVoteStore.creditsLeft,
      });
    }
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

  toggleVotesModal(value) {
    this.setState({
      showVotesModal: value,
    });
  },

  vote() {
    const {
      proposal,
      votableStep,
    } = this.props;
    ProposalActions
      .vote(
        votableStep.id,
        proposal.id,
        proposal.estimation
      )
    ;
  },

  deleteVote() {
    const {
      proposal,
      votableStep,
    } = this.props;
    ProposalActions
      .deleteVote(
        votableStep.id,
        proposal.id,
        proposal.estimation
      )
    ;
  },

  voteAction() {
    const { user } = this.props;
    if (!user || !this.state.userHasVote) {
      this.toggleVotesModal(true);
      return;
    }
    this.deleteVote();
  },

  loadProposal() {
    const { form } = this.props;
    ProposalActions.getOne(
      form.id,
      this.state.proposal.id
    );
  },

  render() {
    const { proposal, userHasVote, creditsLeft, showVotesModal } = this.state;
    const { form, categories, votableStep, features } = this.props;
    const showVotes = !!votableStep && votableStep.voteType !== VOTE_TYPE_DISABLED;
    const showVotesTab = proposal.votesCount > 0 || showVotes;
    return (
      <div>
        <ProposalPageAlert proposal={proposal} />
        <ProposalPageHeader
          proposal={proposal}
          className="container container--custom"
          showThemes={features.themes && form.usingThemes}
          userHasVote={userHasVote}
          onVote={this.voteAction}
          selectionStep={votableStep}
          creditsLeft={creditsLeft}
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
                      <span className="badge">{proposal.votesCount}</span>
                    </NavItem>
                  }
                  <NavItem eventKey="blog" className="tabs__pill">
                    {this.getIntlMessage('proposal.tabs.blog')}
                    <span className="badge">{proposal.postsCount}</span>
                  </NavItem>
                </Nav>
                <ProposalVoteButtonWrapper
                  selectionStep={votableStep}
                  proposal={proposal}
                  creditsLeft={creditsLeft}
                  userHasVote={userHasVote}
                  onClick={this.voteAction}
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
                        userHasVote={userHasVote}
                        selectionStep={votableStep}
                        creditsLeft={creditsLeft}
                        onVote={this.voteAction}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <ProposalPageMetadata
                        proposal={proposal}
                        showDistricts={features.districts}
                        showCategories={form.usingCategories}
                        showNullEstimation={!!votableStep && votableStep.voteType === VOTE_TYPE_BUDGET}
                      />
                      <br />
                      {
                        votableStep && votableStep.voteThreshold > 0 &&
                        <span>
                          <ProposalPageVoteThreshold proposal={proposal} step={votableStep} /><br />
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
                    form={form}
                    id={proposal.id}
                  />
                </Tab.Pane>
                {
                  showVotesTab
                  && <Tab.Pane eventKey="votes">
                    <ProposalPageVotes
                      proposal={proposal}
                    />
                  </Tab.Pane>
                }
                <Tab.Pane eventKey="blog">
                  <ProposalPageBlog />
                </Tab.Pane>
              </Tab.Content>
            </div>
            {
              showVotes
              && <ProposalVoteModal
                proposal={proposal}
                selectionStep={votableStep}
                showModal={showVotesModal}
                onToggleModal={this.toggleVotesModal}
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
    user: state.default.user,
    features: state.default.features,
    proposal: state.proposal.proposals[state.proposal.currentProposalById],
  };
};

export default connect(mapStateToProps)(ProposalPage);
