// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import PieChartPlaceholder from '~ui/Dashboard/PieChart/placeholder';
import TrafficChartPlaceholder from '~ui/Dashboard/TrafficChart/placeholder';
import SectionPlaceholder from '~ui/Dashboard/Section/placeholder';
import TabsChartPlaceholder from '~ui/Dashboard/TabsChart/placeholder';
import ViewChartPlaceholder from '~ui/Dashboard/ViewChart/placeholder';
import ContributorPlaceholder from './Sections/SectionTopContributors/ContributorPlaceholder';
import SmallChartPlaceholder from '~ui/Dashboard/SmallChart/placeholder';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import { headingStyles } from '~ui/Primitives/Heading';
import { FontWeight } from '~ui/Primitives/constants';
import AppBox from '~ui/Primitives/AppBox';
import DashboardFiltersPlaceholder from '~/components/Admin/Dashboard/DashboardFilters/DashboardFiltersPlaceholder';

const DashboardPagePlaceholder = (): React.Node => {
  const intl = useIntl();

  return (
    <Flex direction="column" spacing={6}>
      <AppBox px={6} py={4} bg="white">
        <Text color="blue.800" {...headingStyles.h4} fontWeight={FontWeight.Semibold}>
          {intl.formatMessage({ id: 'dashboard-platform' })}
        </Text>
      </AppBox>

      <Flex direction="column" px={8} py={6} spacing={8}>
        <DashboardFiltersPlaceholder />

        <Flex direction="row" justify="space-between" spacing={8}>
          <SmallChartPlaceholder />
          <SmallChartPlaceholder />
          <SmallChartPlaceholder />
          <SmallChartPlaceholder />
        </Flex>

        <Flex direction="row" spacing={8}>
          <SectionPlaceholder width="50%">
            <TabsChartPlaceholder />
          </SectionPlaceholder>

          <Flex direction="column" width="50%" spacing={8}>
            <SectionPlaceholder>
              <Flex direction="column" spacing={5}>
                <ViewChartPlaceholder />
                <ViewChartPlaceholder />
                <ViewChartPlaceholder />
              </Flex>
            </SectionPlaceholder>

            <SectionPlaceholder>
              <Flex direction="row" justify="space-between" spacing={7}>
                <ContributorPlaceholder />
                <ContributorPlaceholder />
                <ContributorPlaceholder />
                <ContributorPlaceholder />
              </Flex>
            </SectionPlaceholder>
          </Flex>
        </Flex>

        <Flex direction="row" justify="space-between" spacing={8}>
          <SectionPlaceholder width="50%">
            <TrafficChartPlaceholder />
          </SectionPlaceholder>

          <SectionPlaceholder width="50%">
            <PieChartPlaceholder />
          </SectionPlaceholder>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default DashboardPagePlaceholder;
