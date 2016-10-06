import React, { PropTypes } from 'react';
import { Row, Button } from 'react-bootstrap';
import classNames from 'classnames';
import { IntlMixin, FormattedMessage } from 'react-intl';
import UserBox from '../../User/UserBox';
import AllVotesModal from '../../Votes/AllVotesModal';
import { PROPOSAL_VOTES_TO_SHOW } from '../../../constants/ProposalConstants';

const ProposalPageVotes = React.createClass({
  displayName: 'ProposalPageVotes',
  propTypes: {
    proposal: PropTypes.object.isRequired,
    stepId: PropTypes.number.isRequired,
    votes: PropTypes.object.isRequired,
    className: PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
    };
  },

  getInitialState() {
    return {
      showModal: false,
    };
  },

  componentDidMount() {
    this.loadProposalVotes();
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
    const { className, proposal } = this.props;
    const votesToDisplay = this.state.votes.slice(0, PROPOSAL_VOTES_TO_SHOW);
    const moreVotes = proposal.votesCount - PROPOSAL_VOTES_TO_SHOW > 0;

    if (proposal.votesCount <= 0) {
      return <p>{this.getIntlMessage('proposal.vote.none')}</p>;
    }

    const classes = {
      proposal__votes: true,
      [className]: true,
    };

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
            votesToDisplay.map((vote, index) =>
              <UserBox
                key={index}
                user={vote.user}
                username={vote.username}
                className="proposal__vote"
              />
            )
          }
        </Row>
        {
          moreVotes
          && <Button
              bsStyle="primary"
              onClick={this.showModal}
              className="btn--outline"
          >
            {this.getIntlMessage('proposal.vote.show_more')}
          </Button>
        }
        <AllVotesModal
          votes={proposal.votes}
          onToggleModal={this.toggleModal}
          showModal={this.state.showModal}
        />
      </div>
    );
  },

});

export default ProposalPageVotes;
