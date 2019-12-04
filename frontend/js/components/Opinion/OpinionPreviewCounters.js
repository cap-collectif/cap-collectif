// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { COMMENT_SYSTEM_NONE } from '../../constants/ArgumentConstants';
import { VOTE_WIDGET_DISABLED } from '../../constants/VoteConstants';
import InlineList from '../Ui/List/InlineList';
import type { OpinionPreviewCounters_opinion } from '~relay/OpinionPreviewCounters_opinion.graphql';

type Props = {
  opinion: OpinionPreviewCounters_opinion,
};

class OpinionPreviewCounters extends React.Component<Props> {
  render() {
    const { opinion } = this.props;
    if (!opinion || !opinion.section) return null;
    const { section } = opinion;
    const counters = [];
    if (section.voteWidgetType !== VOTE_WIDGET_DISABLED) {
      counters.push(
        <FormattedMessage
          id="global.votes"
          values={{
            num: opinion.votes ? opinion.votes.totalCount : 0,
          }}
        />,
      );
    }
    if (opinion.__typename === 'Opinion' && section.versionable && opinion.versions) {
      counters.push(
        <FormattedMessage id="global.versions" values={{ num: opinion.versions.totalCount }} />,
      );
    }
    if (section.commentSystem !== COMMENT_SYSTEM_NONE && opinion.arguments) {
      counters.push(
        <FormattedMessage
          id="global.arguments"
          values={{
            num: opinion.arguments.totalCount,
          }}
        />,
      );
    }
    if (section.sourceable && opinion.sources) {
      counters.push(
        <FormattedMessage
          id="global.sources"
          values={{
            num: opinion.sources.totalCount,
          }}
        />,
      );
    }
    return (
      <InlineList className="excerpt small">
        {counters.map((counter, index) => (
          <li key={index}>{counter}</li>
        ))}
      </InlineList>
    );
  }
}

export default createFragmentContainer(OpinionPreviewCounters, {
  opinion: graphql`
    fragment OpinionPreviewCounters_opinion on OpinionOrVersion {
      ... on Opinion {
        __typename
        votes(first: 0) {
          totalCount
        }
        sources(first: 0) {
          totalCount
        }
        arguments(first: 0) {
          totalCount
        }
        versions(first: 0) {
          totalCount
        }
        section {
          voteWidgetType
          commentSystem
          sourceable
          versionable
        }
      }
      ... on Version {
        __typename
        votes(first: 0) {
          totalCount
        }
        sources(first: 0) {
          totalCount
        }
        arguments(first: 0) {
          totalCount
        }
        section {
          voteWidgetType
          commentSystem
          sourceable
        }
      }
    }
  `,
});
