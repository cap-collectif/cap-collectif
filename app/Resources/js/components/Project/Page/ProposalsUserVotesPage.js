import React from 'react';
import ProposalActions from '../../../actions/ProposalActions';
import ProposalVoteStore from '../../../stores/ProposalVoteStore';
import MessageStore from '../../../stores/MessageStore';
import FlashMessages from '../../Utils/FlashMessages';
import ProposalUserVoteItem from './ProposalUserVoteItem';
import {Table} from 'react-bootstrap';
import {IntlMixin, FormattedMessage} from 'react-intl';

const ProposalsUserVotesPage = React.createClass({
  propTypes: {
    projectId: React.PropTypes.number.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    votes: React.PropTypes.array.isRequired,
    votableStep: React.PropTypes.object,
    creditsLeft: React.PropTypes.number.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      votableStep: null,
    };
  },

  getInitialState() {
    ProposalActions.initProposalVotes(this.props.votableStep, this.props.creditsLeft);
    return {
      messages: {
        'errors': [],
        'success': [],
      },
      votableStep: ProposalVoteStore.votableStep,
      creditsLeft: ProposalVoteStore.creditsLeft,
      votesCount: this.props.votes.length,
      votes: this.props.votes,
    };
  },

  componentWillMount() {
    ProposalVoteStore.addChangeListener(this.onVotesChange);
    MessageStore.addChangeListener(this.onMessageChange);
  },

  componentWillUnmount() {
    ProposalVoteStore.removeChangeListener(this.onVotesChange);
    MessageStore.removeChangeListener(this.onMessageChange);
  },

  onMessageChange() {
    this.setState({
      messages: MessageStore.messages,
    });
  },

  onVotesChange() {
    if (ProposalVoteStore.isProposalVotesListSync) {
      this.setState({
        votableStep: ProposalVoteStore.votableStep,
        creditsLeft: ProposalVoteStore.creditsLeft,
        votes: ProposalVoteStore.proposalVotes,
        votesCount: ProposalVoteStore.votesCount,
      });
      return;
    }

    this.loadVotes();
  },

  loadVotes() {
    ProposalActions.loadProposalVotesForUser(
      this.props.projectId
    );
  },

  render() {
    return (
      <div>
        <FlashMessages errors={this.state.messages.errors} success={this.state.messages.success} style={{marginBottom: 0}} />
        <div className="container container--custom text-center">
          <h1 style={{marginBottom: '0'}}>{this.getIntlMessage('project.votes.title')}</h1>
        </div>
        <div className="container container--custom">
          <h2>
            <FormattedMessage
              num={this.state.votesCount}
              message={this.getIntlMessage('project.votes.nb')}
            />
          </h2>
          <Table responsive hover className="proposals-user-votes__table">
            <tbody>
              {
                this.state.votes.map((vote, index) => {
                  return <ProposalUserVoteItem key={index} vote={vote} />;
                })
              }
            </tbody>
          </Table>
        </div>
      </div>
    );
  },

});

export default ProposalsUserVotesPage;
