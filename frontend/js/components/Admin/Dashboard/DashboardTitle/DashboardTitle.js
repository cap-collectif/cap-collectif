// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import type { DashboardTitle_query$key } from '~relay/DashboardTitle_query.graphql';
import Text from '~ui/Primitives/Text';
import { headingStyles } from '~ui/Primitives/Heading';
import { FontWeight } from '~ui/Primitives/constants';

type Props = {|
  query: DashboardTitle_query$key,
|};

const FRAGMENT = graphql`
  fragment DashboardTitle_query on Query {
    allProject: projects {
      totalCount
    }
    inProgressProjects: projects(status: 1) {
      totalCount
    }
    doneProjects: projects(status: 2) {
      totalCount
    }
  }
`;

const DashboardTitle = ({ query: queryFragment }: Props): React.Node => {
  const query = useFragment(FRAGMENT, queryFragment);
  const intl = useIntl();
  const { allProject, inProgressProjects, doneProjects } = query;

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
