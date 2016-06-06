import React from 'react';
import { Row, Button } from 'react-bootstrap';
import classNames from 'classnames';
import { IntlMixin, FormattedMessage } from 'react-intl';
import UserBox from '../../User/UserBox';
import AllVotesModal from '../../Votes/AllVotesModal';
import ProposalActions from '../../../actions/ProposalActions';
import ProposalVoteStore from '../../../stores/ProposalVoteStore';
import { PROPOSAL_VOTES_TO_SHOW } from '../../../constants/ProposalConstants';

const ProposalPageVotes = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    votes: React.PropTypes.array.isRequired,
    className: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
    };
  },

  getInitialState() {
    return {
      votes: this.props.votes,
      votesCount: this.props.proposal.votesCount,
      showModal: false,
    };
  },

  componentWillMount() {
    ProposalVoteStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadProposalVotes();
  },

  componentWillUnmount() {
    ProposalVoteStore.removeChangeListener(this.onChange);
  },

  onChange() {
    if (ProposalVoteStore.isProposalVotesListSync) {
      this.setState({
        votes: ProposalVoteStore.proposalVotes,
        votesCount: ProposalVoteStore.votesCount,
      });
      return;
    }

    this.loadProposalVotes();
  },

  loadProposalVotes() {
    ProposalActions.loadProposalVotes(this.props.proposal.proposalForm.id, this.props.proposal.id);
  },

  showModal() {
    this.toggleModal(true);
  },

  toggleModal(value) {
    this.setState({
      showModal: value,
    });
  },

  render() {
    const votesToDisplay = this.state.votes.slice(0, PROPOSAL_VOTES_TO_SHOW);
    const moreVotes = this.state.votesCount - PROPOSAL_VOTES_TO_SHOW > 0;

    if (!this.state.votesCount) {
      return null;
    }

    const classes = {
      'proposal__votes': true,
    };
    classes[this.props.className] = true;

    return (
      <div className={classNames(classes)}>
        <h2>
          <FormattedMessage
            message={this.getIntlMessage('proposal.vote.count')}
            num={this.state.votesCount}
          />
        </h2>
        <Row>
          {
            votesToDisplay.map((vote, index) => {
              return <UserBox key={index} user={vote.user} username={vote.username} className="proposal__vote" />;
            })
          }
        </Row>
        {
          moreVotes
          ? <Button
              bsStyle="primary"
              onClick={this.showModal}
              className="btn--outline"
          >
            {this.getIntlMessage('proposal.vote.show_more')}
          </Button>
          : null
        }
        <AllVotesModal
          votes={this.state.votes}
          onToggleModal={this.toggleModal}
          showModal={this.state.showModal}
        />
      </div>
    );
  },

});

export default ProposalPageVotes;
