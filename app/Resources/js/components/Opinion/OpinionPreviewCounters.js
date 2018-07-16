// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { COMMENT_SYSTEM_NONE } from '../../constants/ArgumentConstants';
import { VOTE_WIDGET_DISABLED } from '../../constants/VoteConstants';
import InlineList from "../Ui/List/InlineList";
import type { OpinionPreviewCounters_opinion } from './__generated__/OpinionPreviewCounters_opinion.graphql';

type Props = {
  opinion: OpinionPreviewCounters_opinion,
};

class OpinionPreviewCounters extends React.Component<Props> {

  render() {
    const opinion = this.props.opinion;
    const section = opinion.section;
    const counters = [];
    if (section.voteWidgetType !== VOTE_WIDGET_DISABLED) {
      counters.push(
        <FormattedMessage
          id="global.votes"
          values={{
            num: opinion.votesCount,
          }}
        />,
      );
    }
    if (!opinion.parent && section.versionable) {
      counters.push(
        <FormattedMessage
          id="global.versions"
          values={{
            num: opinion.versionsCount,
          }}
        />,
      );
    }
    if (section.commentSystem !== COMMENT_SYSTEM_NONE) {
      counters.push(
        <FormattedMessage
          id="global.arguments"
          values={{
            num: opinion.argumentsCount,
          }}
        />,
      );
    }
    if (section.sourceable) {
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

export default createFragmentContainer(OpinionPreviewCounters, {
  opinion: graphql`
    fragment OpinionPreviewCounters_opinion on OpinionOrVersion {
      ... on Opinion {
        votesCount
        sourcesCount
        section {
          voteWidgetType
          commentSystem
          sourceable
        }
      }
      ... on Version {
        votesCount
        sourcesCount
        section {
          voteWidgetType
          commentSystem
          sourceable
        }
      }
    }
  `,
});