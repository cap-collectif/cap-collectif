// @flow
import React from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import { COMMENT_SYSTEM_NONE } from '../../constants/ArgumentConstants';
import { VOTE_WIDGET_DISABLED } from '../../constants/VoteConstants';

const OpinionPreviewCounters = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getType() {
    const opinion = this.props.opinion;
    if (opinion.parent) {
      return opinion.parent.type;
    }
    if (opinion.section) {
      return opinion.section;
    }
    return opinion.type;
  },

  render() {
    const opinion = this.props.opinion;
    const type = this.getType();
    const counters = [];
    if (type.voteWidgetType !== VOTE_WIDGET_DISABLED) {
      counters.push(
        <FormattedMessage
          message={this.getIntlMessage('global.votes')}
          num={opinion.votesCount}
        />,
      );
    }
    if (!opinion.parent && type.versionable) {
      counters.push(
        <FormattedMessage
          message={this.getIntlMessage('global.versions')}
          num={opinion.versionsCount}
        />,
      );
    }
    if (type.commentSystem !== COMMENT_SYSTEM_NONE) {
      counters.push(
        <FormattedMessage
          message={this.getIntlMessage('global.arguments')}
          num={opinion.argumentsCount}
        />,
      );
    }
    if (type.sourceable) {
      counters.push(
        <FormattedMessage
          message={this.getIntlMessage('global.sources')}
          num={opinion.sourcesCount}
        />,
      );
    }
    if (!opinion.parent && type.linkable) {
      counters.push(
        <FormattedMessage
          message={this.getIntlMessage('global.links')}
          num={opinion.connectionsCount}
        />,
      );
    }
    return (
      <p className="opinion__votes excerpt small">
        {counters.map((counter, index) => {
          if (index < counters.length - 1) {
            return <span key={index}>{counter}<span> • </span></span>;
          }
          return <span key={index}>{counter}</span>;
        })}
      </p>
    );
  },
});

export default OpinionPreviewCounters;
