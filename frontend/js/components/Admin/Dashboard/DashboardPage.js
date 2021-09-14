// @flow
import * as React from 'react';
import {
  usePreloadedQuery,
  graphql,
  type PreloadedQuery,
  type GraphQLTaggedNode,
} from 'react-relay';
import type { DashboardPageQuery as DashboardPageQueryType } from '~relay/DashboardPageQuery.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import SectionVisitors from './Sections/SectionVisitors/SectionVisitors';
import SectionRegistrations from './Sections/SectionRegistrations/SectionRegistrations';
import SectionContributors from './Sections/SectionContributors/SectionContributors';
import SectionPageViews from '~/components/Admin/Dashboard/Sections/SectionPageViews/SectionPageViews';
import SectionParticipations from '~/components/Admin/Dashboard/Sections/SectionParticipations/SectionParticipations';
import SectionMostVisitedPages from '~/components/Admin/Dashboard/Sections/SectionMostVisitedPages/SectionMostVisitedPages';
import SectionTopContributors from '~/components/Admin/Dashboard/Sections/SectionTopContributors/SectionTopContributors';
import SectionTraffic from '~/components/Admin/Dashboard/Sections/SectionTraffic/SectionTraffic';
import SectionProposalCategories from '~/components/Admin/Dashboard/Sections/SectionProposalCategories/SectionProposalCategories';
import DashboardTitle from '~/components/Admin/Dashboard/DashboardTitle/DashboardTitle';
import DashboardFilters from '~/components/Admin/Dashboard/DashboardFilters/DashboardFilters';
import { useDashboard } from '~/components/Admin/Dashboard/DashboardPage.context';

type Props = {|
  queryReference: PreloadedQuery<DashboardPageQueryType>,
|};

export const DashboardPageQuery: GraphQLTaggedNode = graphql`
  query DashboardPageQuery($filter: QueryAnalyticsFilter!) {
    analytics(filter: $filter) {
      visitors {
        totalCount
        ...SectionVisitors_visitors
      }
      registrations {
        totalCount
        ...SectionRegistrations_registrations
      }
      contributors {
        totalCount
        ...SectionContributors_contributors
      }
      anonymousContributors {
        totalCount
        ...SectionContributors_anonymousContributors
      }
      pageViews {
        totalCount
        ...SectionPageViews_pageViews
      }
      mostVisitedPages {
        totalCount
        ...SectionMostVisitedPages_mostVisitedPages
      }
      topContributors {
        ...SectionTopContributors_topContributors
      }
      trafficSources {
        totalCount
        ...SectionTraffic_traffic
      }
      mostUsedProposalCategories {
        totalCount
        ...SectionProposalCategories_categories
      }
      ...SectionParticipations_analytics
    }
    ...DashboardTitle_query
    ...DashboardFilters_query
  }
`;

const DashboardPage = ({ queryReference }: Props): React.Node => {
  const query = usePreloadedQuery<DashboardPageQueryType>(DashboardPageQuery, queryReference);
  const { filters } = useDashboard();
  const { analytics } = query;
  const hasSmallCharts =
    (analytics.visitors && analytics.visitors.totalCount > 0) ||
    (analytics.registrations && analytics.registrations.totalCount > 0) ||
    (analytics.pageViews && analytics.pageViews.totalCount > 0) ||
    (analytics.contributors && analytics.contributors.totalCount > 0) ||
      (analytics.anonymousContributors && analytics.anonymousContributors.totalCount > 0);

  return (
    <Flex direction="column" spacing={3}>
      <DashboardTitle query={query} />

      <Flex direction="column" px={8} py={6} spacing={8}>
        <DashboardFilters query={query} defaultFilters={filters} />

        {hasSmallCharts && (
          <Flex direction="row" justify="flex-start" overflow="auto" spacing={8}>
            {analytics.visitors && analytics.visitors.totalCount > 0 && (
              <SectionVisitors visitors={analytics.visitors} />
            )}
            {analytics.registrations &&
              analytics.registrations.totalCount > 0 &&
              filters.projectId === 'ALL' && (
                <SectionRegistrations registrations={analytics.registrations} />
              )}
            {((analytics.contributors && analytics.contributors.totalCount > 0) ||
              (analytics.anonymousContributors &&
                analytics.anonymousContributors.totalCount > 0)) && (
              <SectionContributors
                anonymousContributors={analytics.anonymousContributors}
                contributors={analytics.contributors}
              />
            )}
            {analytics.pageViews && analytics.pageViews.totalCount > 0 && (
              <SectionPageViews pageViews={analytics.pageViews} />
            )}
          </Flex>
        )}

        <Flex direction="row" justify="space-between" spacing={8}>
          <SectionParticipations analytics={analytics} />

          <Flex direction="column" spacing={8} width="50%">
            {analytics.mostVisitedPages && analytics.mostVisitedPages.totalCount > 0 && (
              <SectionMostVisitedPages mostVisitedPages={analytics.mostVisitedPages} />
            )}

            {analytics.topContributors &&
              analytics.contributors &&
              analytics.contributors.totalCount > 0 && (
                <SectionTopContributors topContributors={analytics.topContributors} />
              )}
          </Flex>
        </Flex>

        <Flex direction="row" justify="space-between" spacing={8}>
          {analytics.trafficSources && analytics.trafficSources.totalCount > 0 && (
            <SectionTraffic traffic={analytics.trafficSources} />
          )}

          {analytics.mostUsedProposalCategories &&
            analytics.mostUsedProposalCategories?.totalCount > 0 && (
              <SectionProposalCategories categories={analytics.mostUsedProposalCategories} />
            )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default DashboardPage;
