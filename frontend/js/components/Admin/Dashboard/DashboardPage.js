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
import SectionParticipations from '~/components/Admin/Dashboard/Sections/SectionParticipations';
import SectionMostVisitedPages from '~/components/Admin/Dashboard/Sections/SectionMostVisitedPages';
import SectionTopContributors from '~/components/Admin/Dashboard/Sections/SectionTopContributors';
import SectionTraffic from '~/components/Admin/Dashboard/Sections/SectionTraffic';
import SectionProposalCategories from '~/components/Admin/Dashboard/Sections/SectionProposalCategories';

type Props = {|
  queryReference: PreloadedQuery<DashboardPageQueryType>,
|};

export const DashboardPageQuery: GraphQLTaggedNode = graphql`
  query DashboardPageQuery($filter: QueryAnalyticsFilter!) {
    analytics(filter: $filter) {
      visitors {
        ...SectionVisitors_visitors
      }
      registrations {
        ...SectionRegistrations_registrations
      }
      contributors {
        ...SectionContributors_contributors
      }
      pageViews {
        ...SectionPageViews_pageViews
      }
      mostVisitedPages {
        ...SectionMostVisitedPages_mostVisitedPages
      }
      topContributors {
        ...SectionTopContributors_topContributors
      }
      trafficSources {
        ...SectionTraffic_traffic
      }
      mostUsedProposalCategories {
        ...SectionProposalCategories_categories
      }
      ...SectionParticipations_analytics
    }
  }
`;

const DashboardPage = ({ queryReference }: Props): React.Node => {
  const { analytics } = usePreloadedQuery<DashboardPageQueryType>(
    DashboardPageQuery,
    queryReference,
  );

  return (
    <Flex direction="column" px={8} py={6} spacing={8}>
      <Flex direction="row" justify="space-between">
        <SectionVisitors visitors={analytics.visitors} />
        <SectionRegistrations registrations={analytics.registrations} />
        <SectionContributors contributors={analytics.contributors} />
        <SectionPageViews pageViews={analytics.pageViews} />
      </Flex>

      <Flex direction="row" justify="space-between" spacing={8}>
        <SectionParticipations analytics={analytics} />

        <Flex direction="column" spacing={8} width="50%">
          <SectionMostVisitedPages mostVisitedPages={analytics.mostVisitedPages} />
          <SectionTopContributors topContributors={analytics.topContributors} />
        </Flex>
      </Flex>

      <Flex direction="row" justify="space-between" spacing={8}>
        <SectionTraffic traffic={analytics.trafficSources} />
        <SectionProposalCategories categories={analytics.mostUsedProposalCategories} />
      </Flex>
    </Flex>
  );
};

export default DashboardPage;
