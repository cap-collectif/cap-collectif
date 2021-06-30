// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { Link, useRouteMatch } from 'react-router-dom';
import { createFragmentContainer, graphql } from 'react-relay';
import Flex from '~ui/Primitives/Layout/Flex';
import ContributionStep from './ContributionStep';
import { type IndexContributions_project } from '~relay/IndexContributions_project.graphql';
import Text from '~ui/Primitives/Text';
import Heading from '~ui/Primitives/Heading';
import { clearToasts } from '~ds/Toast';

export const STEP_CONTRIBUTIONS = ['CollectStep', 'DebateStep'];

export const getContributionsPath = (
  baseUrl: string,
  type: string,
  stepId?: string,
  stepSlug?: ?string,
) => {
  switch (type) {
    case 'CollectStep':
      return `${baseUrl}/proposals${stepId ? `?step=${encodeURIComponent(stepId)}` : ''}`;
    case 'DebateStep':
      return `${baseUrl}/debate/${stepSlug || ':stepSlug'}`;
    default:
      return baseUrl;
  }
};

type Props = {|
  +project: IndexContributions_project,
|};

export const IndexContributions = ({ project }: Props) => {
  const { url: baseLinkUrl } = useRouteMatch();
  const intl = useIntl();
  React.useEffect(() => {
    clearToasts();
  });
  return (
    <Flex direction="column">
      <Heading as="h4" mb={2} color="blue.900">
        {intl.formatMessage({ id: 'select-a-step' })}
      </Heading>
      <Text color="gray.500" mb={8}>
        {intl.formatMessage({ id: 'consult-all-contrib-on-step' })}
      </Text>

      <Flex direction="column" spacing={4}>
        {project.steps
          .filter(step => STEP_CONTRIBUTIONS.includes(step.__typename))
          .map(step => (
            <Link
              key={step.id}
              to={getContributionsPath(baseLinkUrl, step.__typename, step.id, step.slug)}>
              <ContributionStep step={step} />
            </Link>
          ))}
      </Flex>
    </Flex>
  );
};

export default createFragmentContainer(IndexContributions, {
  project: graphql`
    fragment IndexContributions_project on Project {
      steps {
        id
        __typename
        slug
        ...ContributionStep_step
      }
    }
  `,
});
