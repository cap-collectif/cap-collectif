import React from 'react';
import {IntlMixin, FormattedNumber} from 'react-intl';
import ProposalActions from '../../../actions/ProposalActions';
import UserLink from '../../User/UserLink';
import {Button} from 'react-bootstrap';

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
        <td><UserLink user={proposal.author}/></td>
        <td>{proposal.district.name}</td>
        <td><FormattedNumber value={proposal.estimation} style="currency" currency="EUR" /></td>
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
