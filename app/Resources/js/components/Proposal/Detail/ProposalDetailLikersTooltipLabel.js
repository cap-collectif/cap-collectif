import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage, FormattedHTMLMessage } from 'react-intl';

const ProposalDetailLikersTooltipLabel = React.createClass({
  propTypes: {
    likers: PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { likers } = this.props;
    if (likers.length === 1) {
      return (
        <FormattedMessage
          message={this.getIntlMessage('proposal.likers.label')}
          user={likers[0].displayName}
        />
      );
    }
    if (likers.length > 1) {
      const message = likers.map((liker) => liker.displayName).join('<br/>');
      return (
        <span>
          <FormattedMessage
            message={this.getIntlMessage('proposal.likers.count')}
            num={likers.length}
          />
          <br/>
          <FormattedHTMLMessage message={message}/>
        </span>
      );
    }
    return null;
  },
});

export default ProposalDetailLikersTooltipLabel;
