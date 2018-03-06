import React from 'react';
import moment from 'moment';
import { FormattedDate } from 'react-intl';
import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';

const ProposalPreviewHeader = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired
  },

  render() {
    const proposal = this.props.proposal;
    return (
      <div>
        <UserAvatar user={proposal.author} className="pull-left proposal__avatar" />
        <div className="proposal__author">
          <UserLink user={proposal.author} />
          <p className="excerpt small proposal__date">
            <FormattedDate
              value={moment(proposal.createdAt)}
              day="numeric"
              month="long"
              year="numeric"
            />
          </p>
        </div>
      </div>
    );
  }
});

export default ProposalPreviewHeader;
