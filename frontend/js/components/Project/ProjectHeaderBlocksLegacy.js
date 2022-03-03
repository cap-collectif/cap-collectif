// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import moment from 'moment';
import ProjectHeaderLayout from '~ui/Project/ProjectHeaderLegacy';
import type { ProjectHeaderBlocksLegacy_project$key } from '~relay/ProjectHeaderBlocksLegacy_project.graphql';
import Text from '~ui/Primitives/Text';
import AppBox from '~ui/Primitives/AppBox';

const FRAGMENT = graphql`
  fragment ProjectHeaderBlocksLegacy_project on Project {
    isVotesCounterDisplayable
    isContributionsCounterDisplayable
    isParticipantsCounterDisplayable
    steps {
      state
      timeRange {
        endAt
      }
    }
    contributions {
      totalCount
    }
    opinions: contributions(type: OPINION) {
      totalCount
    }
    opinionVersions: contributions(type: OPINIONVERSION) {
      totalCount
    }
    sources: contributions(type: SOURCE) {
      totalCount
    }
    replies: contributions(type: REPLY) {
      totalCount
    }
    repliesAnonymous: contributions(type: REPLY_ANONYMOUS) {
      totalCount
    }
    argument: contributions(type: ARGUMENT) {
      totalCount
    }
    debateArgument: contributions(type: DEBATEARGUMENT) {
      totalCount
    }
    proposals: contributions(type: PROPOSAL) {
      totalCount
    }
    contributors {
      totalCount
    }
    votes {
      totalCount
    }
    anonymousVotes: votes(anonymous: true) {
      totalCount
    }
    paperVotesTotalCount
  }
`;
export type Props = {|
  +project: ProjectHeaderBlocksLegacy_project$key,
|};

const ProjectHeaderBlocksLegacy = ({ project }: Props): React.Node => {
  const data = useFragment(FRAGMENT, project);
  const intl = useIntl();
  const {
    steps,
    opinions,
    opinionVersions,
    sources,
    replies,
    repliesAnonymous,
    argument,
    debateArgument,
    proposals,
    votes,
    anonymousVotes,
    paperVotesTotalCount,
    contributions,
    contributors,
    isContributionsCounterDisplayable,
    isVotesCounterDisplayable,
    isParticipantsCounterDisplayable,
  } = data;
  const numericVotesTotalCount = votes?.totalCount ?? 0;
  const votesTotalCount = numericVotesTotalCount + paperVotesTotalCount;
  const participantsTotalCount =
    contributors.totalCount + anonymousVotes.totalCount + repliesAnonymous.totalCount;
  const getDaysLeftBlock = () => {
    if (steps.length === 1 && steps[0].state === 'OPENED' && steps[0].timeRange?.endAt) {
      const count = moment(steps[0].timeRange?.endAt).diff(moment(), 'days');
      return (
        <ProjectHeaderLayout.Block
          title={intl.formatMessage({ id: 'count.daysLeft' }, { count })}
          content={count}
        />
      );
    }
    return null;
  };

  const getVotesTooltip = () => {
    if (paperVotesTotalCount > 0) {
      return (
        <AppBox padding={1} textAlign="center">
          {numericVotesTotalCount > 0 && (
            <Text marginBottom="0px !important">
              {intl.formatMessage({ id: 'numeric-votes-count' }, { num: numericVotesTotalCount })}
            </Text>
          )}
          <Text marginBottom="0px !important">
            {intl.formatMessage({ id: 'paper-votes-count' }, { num: paperVotesTotalCount })}
          </Text>
        </AppBox>
      );
    }
  };

  const getParticipantsTooltip = () => {
    if (paperVotesTotalCount > 0) {
      return (
        <AppBox padding={1} textAlign="center">
          <Text marginBottom="0px !important">
            {intl.formatMessage({ id: 'online-contributors' }, { count: participantsTotalCount })}
          </Text>
        </AppBox>
      );
    }
  };

  const getContributionsTooltip = () => {
    if (
      opinions.totalCount > 0 ||
      proposals.totalCount > 0 ||
      opinionVersions.totalCount > 0 ||
      sources.totalCount > 0 ||
      replies.totalCount > 0 ||
      argument.totalCount > 0 ||
      debateArgument.totalCount > 0
    ) {
      return (
        <AppBox padding={1} textAlign="center">
          {(opinions.totalCount > 0 || proposals.totalCount > 0) && (
            <Text marginBottom="0px !important">
              <FormattedMessage
                id="proposal-count"
                values={{ count: opinions.totalCount + proposals.totalCount }}
              />
            </Text>
          )}
          {opinionVersions.totalCount > 0 && (
            <Text marginBottom="0px !important">
              <FormattedMessage
                id="amendment-count"
                values={{ count: opinionVersions.totalCount }}
              />
            </Text>
          )}
          {(argument.totalCount > 0 || debateArgument.totalCount > 0) && (
            <Text marginBottom="0px !important">
              <FormattedMessage
                id="argument-count"
                values={{ count: argument.totalCount + debateArgument.totalCount }}
              />
            </Text>
          )}
          {sources.totalCount > 0 && (
            <Text marginBottom="0px !important">
              <FormattedMessage id="source-count" values={{ count: sources.totalCount }} />
            </Text>
          )}
          {replies.totalCount > 0 && (
            <Text marginBottom="0px !important">
              <FormattedMessage id="answer-count" values={{ count: replies.totalCount }} />
            </Text>
          )}
        </AppBox>
      );
    }
  };
  return (
    <ProjectHeaderLayout.Blocks>
      {getDaysLeftBlock()}
      {isContributionsCounterDisplayable && (
        <ProjectHeaderLayout.Block
          tooltipLabel={getContributionsTooltip()}
          title={intl.formatMessage(
            { id: 'contribution-plural' },
            { num: contributions.totalCount },
          )}
          content={contributions.totalCount}
        />
      )}
      {votesTotalCount > 0 && isVotesCounterDisplayable && (
        <ProjectHeaderLayout.Block
          tooltipLabel={getVotesTooltip()}
          contentId="votes-counter-pill"
          title={intl.formatMessage({ id: 'vote-plural' }, { num: votesTotalCount })}
          content={votesTotalCount}
        />
      )}

      {isParticipantsCounterDisplayable && (
        <ProjectHeaderLayout.Block
          tooltipLabel={getParticipantsTooltip()}
          title={intl.formatMessage(
            { id: 'project.preview.counters.contributors' },
            { num: participantsTotalCount },
          )}
          content={participantsTotalCount}
        />
      )}
    </ProjectHeaderLayout.Blocks>
  );
};

export default ProjectHeaderBlocksLegacy;
