// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import type { SectionTopContributors_topContributors$key } from '~relay/SectionTopContributors_topContributors.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Section from '~ui/Dashboard/Section';
import Contributor from './Contributor';

type Props = {|
  +topContributors: SectionTopContributors_topContributors$key,
|};

const FRAGMENT = graphql`
  fragment SectionTopContributors_topContributors on PlatformAnalyticsTopContributor
    @relay(plural: true) {
    ...Contributor_contributor
  }
`;

const SectionTopContributors = ({
  topContributors: topContributorsFragment,
}: Props): React.Node => {
  const topContributors = useFragment(FRAGMENT, topContributorsFragment);
  const intl = useIntl();

  return (
    <Section label={intl.formatMessage({ id: 'most-active-contributors' })}>
      <Flex direction="row" justify="space-between">
        {topContributors.map((contributor, idx) => (
          <Contributor contributor={contributor} key={idx} />
        ))}
      </Flex>
    </Section>
  );
};

export default SectionTopContributors;
