// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import moment from 'moment';
import { Text, Box } from '@cap-collectif/ui'
import ProjectHeaderLayout from '~ui/Project/ProjectHeader';
import type { ProjectHeaderBlocks_project$key } from '~relay/ProjectHeaderBlocks_project.graphql';

const FRAGMENT = graphql`
  fragment ProjectHeaderBlocks_project on Project {
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
  }
`;
export type Props = {|
  +project: ProjectHeaderBlocks_project$key,
|};

const ProjectHeaderBlocks = ({ project }: Props): React.Node => {
  const data = useFragment(FRAGMENT, project);
  const intl = useIntl();
  const { opinions, opinionVersions, sources, replies, argument, debateArgument, proposals } = data;
  const getDaysLeftBlock = () => {
    if (
      data.steps.length === 1 &&
      data.steps[0].state === 'OPENED' &&
      data.steps[0].timeRange?.endAt
    ) {
      const count = moment(data.steps[0].timeRange?.endAt).diff(moment(), 'days');
      return (
        <ProjectHeaderLayout.Block
          title={intl.formatMessage({ id: 'count.daysLeft' }, { count })}
          content={count}
        />
      );
    }
    return null;
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
        <Box padding={1} textAlign="center">
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
        </Box>
      );
    }
  };
  return (
    <ProjectHeaderLayout.Blocks>
      {getDaysLeftBlock()}
      {data.isContributionsCounterDisplayable && (
        <ProjectHeaderLayout.Block
          tooltipLabel={getContributionsTooltip()}
          title={intl.formatMessage(
            { id: 'contribution-plural' },
            { num: data.contributions.totalCount },
          )}
          content={data.contributions.totalCount}
        />
      )}
      {!!data.votes.totalCount && data.isVotesCounterDisplayable && (
        <ProjectHeaderLayout.Block
          contentId="votes-counter-pill"
          title={intl.formatMessage({ id: 'vote-plural' }, { num: data.votes.totalCount })}
          content={data.votes.totalCount}
        />
      )}

      {data.isParticipantsCounterDisplayable && (
        <ProjectHeaderLayout.Block
          title={intl.formatMessage(
            { id: 'project.preview.counters.contributors' },
            { num: data.contributors.totalCount + data.anonymousVotes.totalCount + data.repliesAnonymous.totalCount },
          )}
          content={data.contributors.totalCount + data.anonymousVotes.totalCount + data.repliesAnonymous.totalCount}
        />
      )}
    </ProjectHeaderLayout.Blocks>
  );
};

export default ProjectHeaderBlocks;
