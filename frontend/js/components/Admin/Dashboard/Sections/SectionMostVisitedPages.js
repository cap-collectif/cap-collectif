// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import type { SectionMostVisitedPages_mostVisitedPages$key } from '~relay/SectionMostVisitedPages_mostVisitedPages.graphql';
import ViewChart from '~ui/Dashboard/ViewChart';
import Section from '~ui/Dashboard/Section';

type Props = {|
  +mostVisitedPages: SectionMostVisitedPages_mostVisitedPages$key,
|};

const FRAGMENT = graphql`
  fragment SectionMostVisitedPages_mostVisitedPages on PlatformAnalyticsMostVisitedPages {
    totalCount
    values {
      key
      totalCount
    }
  }
`;

const SectionMostVisitedPages = ({
  mostVisitedPages: mostVisitedPagesFragment,
}: Props): React.Node => {
  const mostVisitedPages = useFragment(FRAGMENT, mostVisitedPagesFragment);
  const intl = useIntl();

  return (
    <Section label={intl.formatMessage({ id: 'most-visited-pages' })}>
      {mostVisitedPages.values.map((value, idx) => (
        <ViewChart
          level={idx + 1}
          total={mostVisitedPages.totalCount}
          count={value.totalCount}
          label={value.key}
        />
      ))}
    </Section>
  );
};

export default SectionMostVisitedPages;
