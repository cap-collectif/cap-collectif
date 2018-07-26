// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { COMMENT_SYSTEM_NONE } from '../../constants/ArgumentConstants';
import { VOTE_WIDGET_DISABLED } from '../../constants/VoteConstants';
import InlineList from "../Ui/List/InlineList";

type Props = {
  opinion: Object,
};

class OpinionPreviewCounters extends React.Component<Props> {
  getType = () => {
    const opinion = this.props.opinion;
    if (opinion.parent) {
      return opinion.parent.type;
    }
    if (opinion.section) {
      return opinion.section;
    }
    return opinion.type;
  };

  render() {
    const opinion = this.props.opinion;
    const type = this.getType();
    const counters = [];
    if (type.voteWidgetType !== VOTE_WIDGET_DISABLED) {
      counters.push(
        <FormattedMessage
          id="global.votes"
          values={{
            num: opinion.votesCount,
          }}
        />,
      );
    }
    if (!opinion.parent && type.versionable) {
      counters.push(
        <FormattedMessage
          id="global.versions"
          values={{
            num: opinion.versionsCount,
          }}
        />,
      );
    }
    if (type.commentSystem !== COMMENT_SYSTEM_NONE) {
      counters.push(
        <FormattedMessage
          id="global.arguments"
          values={{
            num: opinion.argumentsCount,
          }}
        />,
      );
    }
    if (type.sourceable) {
      counters.push(
        <FormattedMessage
          id="global.sources"
          values={{
            num: opinion.sourcesCount,
          }}
        />,
      );
    }
    return (
      <InlineList>
        {counters.map((counter, index) => {
            return (
              <li key={index}>
                {counter}
              </li>
            )
        })}
      </InlineList>
    );
  }
}

export default OpinionPreviewCounters;
