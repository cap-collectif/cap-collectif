import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import UserLink from '../../User/UserLink';
import { Button } from 'react-bootstrap';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import ProposalDetailsEstimation from '../../Proposal/Detail/ProposalDetailEstimation';
import { deleteVote } from '../../../redux/modules/proposal';
import { connect } from 'react-redux';

export const ProposalUserVoteItem = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const {
      step,
      proposal,
      dispatch,
    } = this.props;
    return (
      <tr className="proposals-user-votes__row" id={`vote-step${step.id}-proposal${proposal.id}`}>
        <td><a href={proposal._links.show}>{proposal.title}</a></td>
        <td><i className="cap cap-user-2"></i><UserLink user={proposal.author} /></td>
        {
          proposal.district &&
            <td><i className="cap cap-marker-1"></i>{proposal.district.name}</td>
        }
        <td>
          <ProposalDetailsEstimation
            proposal={proposal}
            showNullEstimation={step.voteType === VOTE_TYPE_BUDGET}
          />
        </td>
        <td>
          <Button onClick={() => {
            deleteVote(dispatch, step, proposal);
            location.reload();
          }} className="proposal-vote__delete"
          >
            {this.getIntlMessage('project.votes.delete')}
          </Button>
        </td>
      </tr>
    );
  },

});

export default connect()(ProposalUserVoteItem);
