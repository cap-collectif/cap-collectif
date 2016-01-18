import React from 'react';
import {Row, Col} from 'react-bootstrap';
import classNames from 'classnames';
import {IntlMixin} from 'react-intl';
import ProposalPageHeader from './ProposalPageHeader';
import ProposalPageContent from './ProposalPageContent';
import ProposalPageAnswer from './ProposalPageAnswer';
import ProposalPageAlert from './ProposalPageAlert';
import ProposalPageVotes from './ProposalPageVotes';
import ProposalPageComments from './ProposalPageComments';
import ProposalStore from '../../../stores/ProposalStore';
import ProposalVoteStore from '../../../stores/ProposalVoteStore';
import MessageStore from '../../../stores/MessageStore';
import ProposalActions from '../../../actions/ProposalActions';
import ProposalVoteSidebar from '../Vote/ProposalVoteSidebar';
import FlashMessages from '../../Utils/FlashMessages';
import {VOTE_TYPE_DISABLED} from '../../../constants/ProposalConstants';

const ProposalPage = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
    proposal: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    votes: React.PropTypes.array.isRequired,
    votableStep: React.PropTypes.object,
    userHasVote: React.PropTypes.bool,
    creditsLeft: React.PropTypes.number.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      votableStep: null,
      userHasVote: false,
    };
  },

  getInitialState() {
    ProposalActions.initProposalVotes(this.props.creditsLeft, !!this.props.userHasVote);
    ProposalActions.initProposal(this.props.proposal);
    return {
      messages: {
        'errors': [],
        'success': [],
      },
      proposal: ProposalStore.proposal,
      userHasVote: ProposalVoteStore.userHasVote,
      creditsLeft: ProposalVoteStore.creditsLeft,
      expandSidebar: false,
    };
  },

  componentWillMount() {
    ProposalStore.addChangeListener(this.onChange);
    ProposalVoteStore.addChangeListener(this.onVoteChange);
    MessageStore.addChangeListener(this.onMessageChange);
  },

  componentWillUnmount() {
    ProposalStore.removeChangeListener(this.onChange);
    ProposalVoteStore.removeChangeListener(this.onVoteChange);
    MessageStore.removeChangeListener(this.onMessageChange);
  },

  onMessageChange() {
    this.setState({
      messages: MessageStore.messages,
    });
  },

  onVoteChange() {
    this.setState({
      userHasVote: ProposalVoteStore.userHasVote,
      creditsLeft: ProposalVoteStore.creditsLeft,
    });
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
        <FlashMessages errors={this.state.messages.errors} success={this.state.messages.success} style={{marginBottom: 0}} />
        <div id="sidebar-container" className={wrapperClassName}>
          <Row>
            <Col xs={12} sm={showSidebar ? 9 : 12}>
              <ProposalPageAlert proposal={proposal} />
              <ProposalPageHeader
                proposal={proposal}
                className={containersClassName}
              />
              {
                proposal.answer
                  ? <ProposalPageAnswer
                      answer={proposal.answer}
                      className={containersClassName}
                  />
                  : null
              }
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

export default ProposalPage;
