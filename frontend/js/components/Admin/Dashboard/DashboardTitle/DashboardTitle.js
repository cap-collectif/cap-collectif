// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import type { DashboardTitle_viewer$key } from '~relay/DashboardTitle_viewer.graphql';
import Text from '~ui/Primitives/Text';
import { headingStyles } from '~ui/Primitives/Heading';
import { FontWeight } from '~ui/Primitives/constants';

type Props = {|
  viewer: DashboardTitle_viewer$key,
|};

const FRAGMENT = graphql`
  fragment DashboardTitle_viewer on User
  @argumentDefinitions(affiliations: { type: "[ProjectAffiliation!]" })
  {
    allProject: projects(affiliations: $affiliations) {
        totalCount
    }
    inProgressProjects: projects(affiliations: $affiliations, status: 1) {
        totalCount
    }
    doneProjects: projects(affiliations: $affiliations, status: 2) {
        totalCount
    }
  }
`;

const DashboardTitle = ({ viewer: viewerFragment }: Props): React.Node => {
  const viewer = useFragment(FRAGMENT, viewerFragment);
  const intl = useIntl();
  const { allProject, inProgressProjects, doneProjects } = viewer;

  return (
    <Flex direction="row" align="center" justify="space-between" px={6} py={4} bg="white">
      <Text color="blue.800" {...headingStyles.h4} fontWeight={FontWeight.Semibold}>
        {intl.formatMessage({ id: 'dashboard-platform' })}
      </Text>

      <Flex
        direction="row"
        color="blue.800"
        spacing={4}
        {...headingStyles.h5}
        fontWeight={FontWeight.Semibold}>
        <Text>
          <Text as="span" color="blue.500" mr={1}>
            {allProject.totalCount}
          </Text>
          {intl.formatMessage({ id: 'global.project-dynamic' }, { num: allProject.totalCount })}
        </Text>

        <Text>
          <Text as="span" color="orange.500" mr={1}>
            {inProgressProjects.totalCount}
          </Text>
          {intl.formatMessage({ id: 'global.in-progress' })}
        </Text>

        <Text>
          <Text as="span" color="green.500" mr={1}>
            {doneProjects.totalCount}
          </Text>

          {intl.formatMessage({ id: 'global.done-dynamic' }, { num: doneProjects.totalCount })}
        </Text>
      </Flex>
    </Flex>
  );
};

export default DashboardTitle;
