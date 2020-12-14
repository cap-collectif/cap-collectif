// @flow
import * as React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { createFragmentContainer, graphql } from 'react-relay';
import Flex from '~ui/Primitives/Layout/Flex';
import ContributionStep from './ContributionStep';
import { type IndexContributions_project } from '~relay/IndexContributions_project.graphql';

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

  return (
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
