// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import type { SectionTraffic_traffic$key } from '~relay/SectionTraffic_traffic.graphql';
import TrafficChart from '~ui/Dashboard/TrafficChart';
import Section from '~ui/Dashboard/Section';

type Props = {|
  +traffic: SectionTraffic_traffic$key,
|};

const FRAGMENT = graphql`
  fragment SectionTraffic_traffic on PlatformAnalyticsTrafficSources {
    totalCount
    sources {
      type
      totalCount
    }
  }
`;

const formatSources = (sources, totalCount) =>
  sources.map(source => ({
    id: source.type,
    percentage: Math.round((source.totalCount / totalCount) * 100),
  }));

const SectionTraffic = ({ traffic: trafficFragment }: Props): React.Node => {
  const traffic = useFragment(FRAGMENT, trafficFragment);
  const intl = useIntl();

  return (
    <Section label={intl.formatMessage({ id: 'traffic-source' })} width="50%">
      <TrafficChart percentages={formatSources(traffic.sources, traffic.totalCount)} />
    </Section>
  );
};

export default SectionTraffic;
