// @flow
import { Box, CapUILineHeight, Flex, Heading, Text } from '@cap-collectif/ui';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useLazyLoadQuery, graphql } from 'react-relay';
import type { ProjectStepHeaderQuery as ProjectStepHeaderQueryType } from '~relay/ProjectStepHeaderQuery.graphql';

export const BACKGROUND_COLOR = '#2F6A35';

const QUERY = graphql`
  query ProjectStepHeaderQuery($stepId: ID!) {
    voteStep: node(id: $stepId) {
      ... on SelectionStep {
        title
        project {
          title
          votes {
            totalCount
          }
          contributors {
            totalCount
          }
          contributions {
            totalCount
          }
        }
      }
    }
  }
`;

type Props = {|
  +stepId: string,
|};

const Counter = ({ title, count }: { title: string, count: number }) => (
  <Box color="white" mr={8}>
    <Text as="div" fontSize={2} fontWeight="600">
      {title}
    </Text>
    <Text as="div" fontSize={4} fontWeight="700">
      {count}
    </Text>
  </Box>
);

export const ProjectStepHeader = ({ stepId }: Props) => {
  const data = useLazyLoadQuery<ProjectStepHeaderQueryType>(
    QUERY,
    {
      stepId,
    },
    { fetchPolicy: 'store-and-network' },
  );

  const intl = useIntl();

  if (!data || !data.voteStep) return null;

  const { voteStep } = data;

  return (
    <Flex
      bg={BACKGROUND_COLOR}
      width="100%"
      py={3}
      px={[5, 8]}
      alignItems="center"
      id="step-header"
      justifyContent="space-between">
      <Flex alignItems="center">
        <Box>
          <Heading color="white" as="h2" fontSize={2} lineHeight={CapUILineHeight.Base}>
            {voteStep.project?.title}
          </Heading>
          <Heading color="white" as="h1" fontSize={4} lineHeight={CapUILineHeight.M}>
            {voteStep.title}
          </Heading>
        </Box>
        <Flex display={['none', 'flex']} ml={12}>
          <Counter
            title={intl.formatMessage({ id: 'global.vote' })}
            count={voteStep.project?.votes.totalCount || 0}
          />
          <Counter
            title={intl.formatMessage({ id: 'capco.section.metrics.participants' })}
            count={voteStep.project?.contributors.totalCount || 0}
          />
          <Counter
            title={intl.formatMessage({ id: 'admin.group.moderation' })}
            count={voteStep.project?.contributions.totalCount || 0}
          />
        </Flex>
      </Flex>
      <div id="step-header__nav" />
    </Flex>
  );
};

export default ProjectStepHeader;
