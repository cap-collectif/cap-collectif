import React from 'react';
import moment from 'moment';
import { FormattedDate } from 'react-intl';
import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';
import { CardUser } from "../../Ui/Card/CardUser";

const ProposalPreviewHeader = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },

  render() {
    const proposal = this.props.proposal;
    return (
      <CardUser>
        <div className="card__user__avatar">
          <UserAvatar user={proposal.author} />
        </div>
        <div className="ellipsis">
          <UserLink user={proposal.author} />
          <p className="excerpt small">
            <FormattedDate
              value={moment(proposal.createdAt)}
              day="numeric"
              month="long"
              year="numeric"
            />
          </p>
        </div>
        <hr/>
      </CardUser>
    );
  },
});

export default ProposalPreviewHeader;
