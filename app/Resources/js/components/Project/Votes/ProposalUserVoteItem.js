import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import UserLink from '../../User/UserLink';
import { Button } from 'react-bootstrap';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import ProposalDetailsEstimation from '../../Proposal/Detail/ProposalDetailEstimation';

const ProposalUserVoteItem = React.createClass({
  propTypes: {
    vote: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  handleClick(e) {
    e.preventDefault();
    // ProposalActions.deleteVote(
    //   step.id,
    //   vote.proposal.id
    // );
  },

  render() {
    const {
      step,
      vote,
    } = this.props;
    const proposal = vote.proposal;
    return (
      <tr className="proposals-user-votes__row" id={`vote-step${step.id}-proposal${proposal.id}`}>
        <td><a href={proposal._links.show}>{proposal.title}</a></td>
        <td><i className="cap cap-user-2"></i><UserLink user={proposal.author} /></td>
        <td><i className="cap cap-marker-1"></i>{proposal.district.name}</td>
        <td>
          <ProposalDetailsEstimation
            proposal={proposal}
            showNullEstimation={step.voteType === VOTE_TYPE_BUDGET}
          />
        </td>
        <td>
          <Button onClick={this.handleClick} className="proposal-vote__delete">
            {this.getIntlMessage('project.votes.delete')}
          </Button>
        </td>
      </tr>
    );
  },

});

export default ProposalUserVoteItem;
