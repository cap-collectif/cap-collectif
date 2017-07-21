import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Truncate from 'react-truncate';

const ProposalDetailLikersTooltipLabel = React.createClass({
  propTypes: {
    likers: PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { likers } = this.props;
    if (likers.length === 1) {
      return (
        <Truncate>
          <FormattedMessage
            message={this.getIntlMessage('proposal.likers.label')}
            user={likers[0].displayName}
          />
        </Truncate>
      );
    }
    if (likers.length > 1) {
      const message = likers.map(liker => liker.displayName).join('<br/>');
      return (
        <span>
          <FormattedMessage
            message={this.getIntlMessage('proposal.likers.count')}
            num={likers.length}
          />
          <br />
          <Truncate>
            <FormattedHTMLMessage message={message} />
          </Truncate>
        </span>
      );
    }
    return null;
  },
});

export default ProposalDetailLikersTooltipLabel;
