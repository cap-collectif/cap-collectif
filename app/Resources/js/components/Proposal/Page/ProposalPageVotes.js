import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Button } from 'react-bootstrap';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import UserBox from '../../User/UserBox';
import AllVotesModal from '../../Votes/AllVotesModal';
import { PROPOSAL_VOTES_TO_SHOW } from '../../../constants/ProposalConstants';
import { loadVotes, openVotesModal, closeVotesModal } from '../../../redux/modules/proposal';

const ProposalPageVotes = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    stepId: PropTypes.string.isRequired,
    showModal: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  },

  componentDidMount() {
    const { dispatch, stepId, proposal } = this.props;
    dispatch(loadVotes(stepId, proposal.id));
  },

  render() {
    const { proposal, stepId, showModal, dispatch } = this.props;
    const votes = proposal.votesByStepId[stepId] || [];
    const votesCount = proposal.votesCountByStepId[stepId] || 0;
    const votesToDisplay = votes.slice(0, PROPOSAL_VOTES_TO_SHOW);
    const moreVotes = votesCount - PROPOSAL_VOTES_TO_SHOW > 0;
    if (votesCount === 0) {
      return (
        <p>
          <FormattedMessage id="proposal.vote.none" />
        </p>
      );
    }

    return (
      <div className={classNames({ proposal__votes: true })}>
        <h2>
          <FormattedMessage
            id="proposal.vote.count"
            values={{
              num: votesCount,
            }}
          />
        </h2>
        <Row>
          {votesToDisplay.map((vote, key) => (
            <UserBox
              key={key}
              user={vote.user}
              username={vote.username}
              className="proposal__vote"
            />
          ))}
        </Row>
        {moreVotes && (
          <Button
            bsStyle="primary"
            onClick={() => {
              dispatch(openVotesModal(stepId));
            }}
            className="btn--outline">
            <FormattedMessage id="proposal.vote.show_more" />
          </Button>
        )}
        <AllVotesModal
          votes={votes}
          onToggleModal={() => {
            dispatch(closeVotesModal(stepId));
          }}
          showModal={showModal}
        />
      </div>
    );
  },
});

const mapStateToProps = (state, props) => {
  return {
    showModal: !!(
      state.proposal.currentVotesModal &&
      state.proposal.currentVotesModal.proposalId === props.proposal.id &&
      state.proposal.currentVotesModal.stepId === props.stepId
    ),
  };
};
export default connect(mapStateToProps)(ProposalPageVotes);
