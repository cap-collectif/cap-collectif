import type { FC } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useIntl } from 'react-intl';
import Section from '@ui/Section/Section';
import PieChart from '@ui/Charts/PieChart/PieChart';
import { useDashboard } from '../../Dashboard.context';
import { SectionProposalCategoriesQuery as SectionProposalCategoriesQueryType } from '@relay/SectionProposalCategoriesQuery.graphql';
import { getVariablesQuery, QueryOptions } from '../Sections.utils';
import SectionProposalCategoriesEmpty from './SectionProposalCategoriesEmpty';
import { Text } from '@cap-collectif/ui';

interface SectionProposalCategoriesProps {
    readonly queryOptions: QueryOptions
}

type Categorie = {
    readonly category: {
        readonly id: string;
        readonly name: string;
    };
    readonly totalCount: number;
}

const QUERY = graphql`
    query SectionProposalCategoriesQuery($filter: QueryAnalyticsFilter!) {
        analytics(filter: $filter) {
            mostUsedProposalCategories {
                totalCount
                values {
                    category {
                        id
                        name
                    }
                    totalCount
                }
            }
        }
    }
`;

const formatCategories = (values: ReadonlyArray<Categorie>, totalCount: number) =>
    values.map(value => ({
        id: value.category.id,
        label: value.category.name,
        value: Math.round((value.totalCount / totalCount) * 100),
    }));

const SectionProposalCategories: FC<SectionProposalCategoriesProps> = ({ queryOptions }) => {
    const { filters } = useDashboard();
    const data = useLazyLoadQuery<SectionProposalCategoriesQueryType>(
        QUERY,
        getVariablesQuery(filters),
        queryOptions,
    );
    const intl = useIntl();

    const { mostUsedProposalCategories } = data.analytics;

    if(!mostUsedProposalCategories || mostUsedProposalCategories?.totalCount === 0) return <SectionProposalCategoriesEmpty />;

    return (
        <Section width="50%" spacing={6} border="normal" borderColor="gray.150">
            <Text fontSize={3} color="blue.800">
                {intl.formatMessage({ id: 'categories-most-use-proposal' })}
            </Text>

            <PieChart percentages={formatCategories(mostUsedProposalCategories.values, mostUsedProposalCategories.totalCount)} />
        </Section>
    );
};

export default SectionProposalCategories;
