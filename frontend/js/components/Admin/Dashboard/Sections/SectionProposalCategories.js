// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import type { SectionProposalCategories_categories$key } from '~relay/SectionProposalCategories_categories.graphql';
import Section from '~ui/Dashboard/Section';
import PieChart from '~ui/Dashboard/PieChart';

type Props = {|
  +categories: SectionProposalCategories_categories$key,
|};

const FRAGMENT = graphql`
  fragment SectionProposalCategories_categories on PlatformAnalyticsMostUsedProposalCategories {
    totalCount
    values {
      category {
        id
        name
      }
      totalCount
    }
  }
`;

const formatCategories = values =>
  values.map(value => ({
    id: value.category.id,
    label: value.category.name,
    value: value.totalCount,
  }));

const SectionProposalCategories = ({ categories: categoriesFragment }: Props): React.Node => {
  const categories = useFragment(FRAGMENT, categoriesFragment);
  const intl = useIntl();

  return (
    <Section label={intl.formatMessage({ id: 'categories-most-use-proposal' })} flex={1}>
      <PieChart percentages={formatCategories(categories.values)} />
    </Section>
  );
};

export default SectionProposalCategories;
