import type { FC } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useIntl } from 'react-intl';
import { Flex, Text } from '@cap-collectif/ui';
import Section from '@ui/Section/Section';
import Contributor from './Contributor';
import { useDashboard } from '../../Dashboard.context';
import {
    SectionTopContributorsQuery as SectionTopContributorsQueryType
} from '@relay/SectionTopContributorsQuery.graphql';
import { getVariablesQuery, QueryOptions } from '../Sections.utils';
import SectionTopContributorsEmpty from './SectionTopContributorsEmpty'

interface SectionTopContributorsProps {
    readonly queryOptions: QueryOptions
}

const QUERY = graphql`
    query SectionTopContributorsQuery($filter: QueryAnalyticsFilter!) {
        analytics(filter: $filter) {
            topContributors {
                ...Contributor_contributor
            }
            contributors {
                totalCount
            }
            anonymousContributors {
                totalCount
            }
        }
    }
`;

const SectionTopContributors: FC<SectionTopContributorsProps> = ({
    queryOptions
}) => {
    const { filters } = useDashboard();
    const data = useLazyLoadQuery<SectionTopContributorsQueryType>(
        QUERY,
        getVariablesQuery(filters),
        queryOptions,
    );
    const intl = useIntl();
    const { topContributors, contributors, anonymousContributors } = data.analytics;

    const totalContributorsCount = (contributors?.totalCount || 0) + (anonymousContributors?.totalCount || 0);

    if (totalContributorsCount === 0 || !topContributors) return <SectionTopContributorsEmpty />;

    return (
        <Section spacing={6} border="normal" borderColor="gray.150">
            <Text fontSize={3} color="blue.800">
                {intl.formatMessage({ id: 'most-active-contributors' })}
            </Text>
            <Flex direction="row">
                {topContributors.map((contributor, idx) => (
                    <Contributor contributor={contributor} key={idx} />
                ))}
            </Flex>
        </Section>
    );
};

export default SectionTopContributors;
