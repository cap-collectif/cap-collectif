import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Truncate from 'react-truncate';

const ProposalDetailLikersTooltipLabel = React.createClass({
  propTypes: {
    likers: PropTypes.array.isRequired,
  },

  render() {
    const { likers } = this.props;
    if (likers.length === 1) {
      return (
        <Truncate>
          <FormattedMessage
            id="proposal.likers.label"
            values={{
              user: likers[0].displayName,
            }}
          />
        </Truncate>
      );
    }
    if (likers.length > 1) {
      const message = likers.map(liker => liker.displayName).join('<br/>');
      return (
        <span>
          <FormattedMessage
            id="proposal.likers.count"
            values={{
              num: likers.length,
            }}
          />
          <br />
          <Truncate>
            <div dangerouslySetInnerHTML={{ __html: message }} />
          </Truncate>
        </span>
      );
    }
    return null;
  },
});

export default ProposalDetailLikersTooltipLabel;
