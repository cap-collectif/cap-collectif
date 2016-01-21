import React from 'react';
import {IntlMixin} from 'react-intl';
import ProposalActions from '../../../actions/ProposalActions';
import UserLink from '../../User/UserLink';
import {Button} from 'react-bootstrap';
import {VOTE_TYPE_BUDGET} from '../../../constants/ProposalConstants';
import ProposalDetailsEstimation from '../../Proposal/Detail/ProposalDetailEstimation';

const ProposalUserVoteItem = React.createClass({
  propTypes: {
    vote: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  handleClick(e) {
    e.preventDefault();
    ProposalActions.deleteVote(
      this.props.vote.selectionStep.id,
      this.props.vote.proposal.id
    );
  },

  render() {
    const proposal = this.props.vote.proposal;
    return (
      <tr className="proposals-user-votes__row">
        <td><a href={proposal._links.show}>{proposal.title}</a></td>
        <td><i className="cap cap-user-2"></i><UserLink user={proposal.author}/></td>
        <td><i className="cap cap-marker-1"></i>{proposal.district.name}</td>
        <td>
          <ProposalDetailsEstimation
            proposal={proposal}
            showNullEstimation={this.props.vote.selectionStep.voteType === VOTE_TYPE_BUDGET}
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
