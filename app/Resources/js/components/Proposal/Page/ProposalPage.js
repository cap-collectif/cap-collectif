import React, { PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import classNames from 'classnames';
import { IntlMixin } from 'react-intl';
import ProposalPageHeader from './ProposalPageHeader';
import ProposalPageContent from './ProposalPageContent';
import ProposalPageAnswer from './ProposalPageAnswer';
import ProposalPageAlert from './ProposalPageAlert';
import ProposalPageVotes from './ProposalPageVotes';
import ProposalPageComments from './ProposalPageComments';
import ProposalStore from '../../../stores/ProposalStore';
import ProposalVoteStore from '../../../stores/ProposalVoteStore';
import ProposalActions from '../../../actions/ProposalActions';
import ProposalVoteSidebar from '../Vote/ProposalVoteSidebar';
import { connect } from 'react-redux';
import { VOTE_TYPE_DISABLED, VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';

const ProposalPage = React.createClass({
  propTypes: {
    form: PropTypes.object.isRequired,
    proposal: PropTypes.object.isRequired,
    themes: PropTypes.array.isRequired,
    districts: PropTypes.array.isRequired,
    votes: PropTypes.array.isRequired,
    votableStep: PropTypes.object,
    userHasVote: PropTypes.bool,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      votableStep: null,
      userHasVote: false,
      user: null,
    };
  },

  getInitialState() {
    if (this.props.votableStep) {
      ProposalActions.initProposalVotes(this.props.votableStep.creditsLeft, !!this.props.userHasVote);
    }
    ProposalActions.initProposal(this.props.proposal);
    return {
      proposal: ProposalStore.proposal,
      userHasVote: ProposalVoteStore.userHasVote,
      creditsLeft: ProposalVoteStore.creditsLeft,
      expandSidebar: false,
    };
  },

  componentWillMount() {
    ProposalStore.addChangeListener(this.onChange);
    ProposalVoteStore.addChangeListener(this.onVoteChange);
  },

  componentWillUnmount() {
    ProposalStore.removeChangeListener(this.onChange);
    ProposalVoteStore.removeChangeListener(this.onVoteChange);
  },

  onVoteChange() {
    if (this.props.user) {
      this.setState({
        userHasVote: ProposalVoteStore.userHasVote,
        creditsLeft: ProposalVoteStore.creditsLeft,
      });
    }
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

  loadProposal() {
    ProposalActions.getOne(
      this.props.form.id,
      this.state.proposal.id
    );
  },

  toggleSidebarExpand() {
    this.setState({
      expandSidebar: !this.state.expandSidebar,
    });
  },

  render() {
    const proposal = this.state.proposal;
    const showSidebar = !!this.props.votableStep && this.props.votableStep.voteType !== VOTE_TYPE_DISABLED;
    const wrapperClassName = classNames({
      'container': showSidebar,
      'sidebar__container': showSidebar,
    });
    const containersClassName = classNames({
      'container': !showSidebar,
      'container--thinner': !showSidebar,
      'container--custom': true,
      'container--with-sidebar': showSidebar,
    });
    const overlayClassName = classNames({
      'sidebar__darkened-overlay': this.state.expandSidebar,
    });
    return (
      <div>
        <div id="sidebar-container" className={wrapperClassName}>
          <Row>
            <Col xs={12} sm={showSidebar ? 9 : 12}>
              <ProposalPageAlert proposal={proposal} />
              <ProposalPageHeader
                proposal={proposal}
                className={containersClassName}
                showNullEstimation={this.props.votableStep && this.props.votableStep.voteType === VOTE_TYPE_BUDGET}
              />
              <ProposalPageAnswer
                answer={proposal.answer}
                className={containersClassName}
              />
              <ProposalPageContent
                proposal={proposal}
                form={this.props.form}
                themes={this.props.themes}
                districts={this.props.districts}
                className={containersClassName}
              />
              <ProposalPageVotes
                proposal={proposal}
                votes={this.props.votes}
                className={containersClassName}
              />
              <ProposalPageComments
                form={this.props.form}
                id={proposal.id}
                className={containersClassName}
              />
            </Col>
            {
              showSidebar
              ? <div id="sidebar-overlay" className={overlayClassName} />
              : null
            }
            {
              showSidebar
              ? <ProposalVoteSidebar
                  proposal={proposal}
                  votableStep={this.props.votableStep}
                  userHasVote={this.state.userHasVote}
                  expanded={this.state.expandSidebar}
                  onToggleExpand={this.toggleSidebarExpand}
                  creditsLeft={this.state.creditsLeft}
              />
              : null
            }
          </Row>
        </div>
      </div>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(ProposalPage);
