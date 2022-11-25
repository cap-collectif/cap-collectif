// @flow
import * as React from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import type { OrganizationPageProjectList_organization$key } from '~relay/OrganizationPageProjectList_organization.graphql';
import useIsMobile from '~/utils/hooks/useIsMobile';
import ProjectCard from '~/components/Ui/Project/ProjectCard';
import Flex from '~/components/Ui/Primitives/Layout/Flex';
import Heading from '~/components/Ui/Primitives/Heading';
import Button from '~/components/DesignSystem/Button/Button';
import AppBox from '~/components/Ui/Primitives/AppBox';

const FRAGMENT = graphql`
  fragment OrganizationPageProjectList_organization on Organization
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" })
  @refetchable(queryName: "OrganizationPageProjectListPaginationQuery") {
    projects(first: $count, after: $cursor)
      @connection(key: "OrganizationPageProjectList_projects", filters: ["query", "orderBy"]) {
      totalCount
      edges {
        node {
          id
          ...ProjectCard_project
        }
      }
    }
  }
`;

const getItemStyles = (position: number, fullSizeLayout: boolean, isMobile: boolean) => {
  if (isMobile) return { width: '100%', variantSize: undefined };
  if (fullSizeLayout) {
    if (!position) return { width: '100%', variantSize: 'L' };
    if (position < 3) return { width: '50%', variantSize: 'M' };
    return { width: '33.33%', variantSize: undefined };
  }
  if (!position) return { width: '100%', variantSize: 'M' };
  return { width: '50%', variantSize: undefined };
};

export type Props = {|
  +organization: OrganizationPageProjectList_organization$key,
  +fullSizeLayout: boolean,
|};

export const OrganizationPageProjectList = ({ organization, fullSizeLayout }: Props) => {
  const intl = useIntl();
  const { data, loadNext, hasNext } = usePaginationFragment(FRAGMENT, organization);
  const isMobile = useIsMobile();

  if (!data) return null;

  const { projects } = data;

  return (
    <Flex direction="column" width={['100%', fullSizeLayout ? '100%' : 'calc(70% - 16px)']}>
      <Heading as="h4" mb={4}>
        {intl.formatMessage({ id: 'project.title' })}
      </Heading>
      <Flex flexWrap="wrap">
        {projects?.edges?.map((edge, index) => (
          <ProjectCard
            project={edge?.node}
            key={index}
            {...getItemStyles(index, fullSizeLayout, isMobile)}
            height="auto"
            p={4}
          />
        ))}
      </Flex>
      {hasNext ? (
        <AppBox mt={2} width="100%">
          <Button margin="auto" onClick={() => loadNext(20)} color="blue.500">
            {intl.formatMessage({ id: 'global.more' })}
          </Button>
        </AppBox>
      ) : null}
    </Flex>
  );
};

export default OrganizationPageProjectList;
