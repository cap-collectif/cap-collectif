import type { FC } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useDisclosure } from '@liinkiing/react-hooks';
import { Box } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import ViewChart from '@ui/Charts/ViewChart/ViewChart';
import Section from '@ui/Section/Section';
import ModalSectionMostVisitedPages, { formatLabel } from './ModalSectionMostVisitedPages';
import { useDashboard } from '../../Dashboard.context';
import { SectionMostVisitedPagesQuery as SectionMostVisitedPagesQueryType } from '@relay/SectionMostVisitedPagesQuery.graphql';
import { getVariablesQuery, QueryOptions } from '../Sections.utils';
import SectionMostVisitedPagesEmpty from './SectionMostVisitedPagesEmpty';

type SectionMostVisitedPagesProps = {
    readonly queryOptions: QueryOptions
};

const QUERY = graphql`
    query SectionMostVisitedPagesQuery($filter: QueryAnalyticsFilter!) {
        analytics(filter: $filter) {
            mostVisitedPages {
                totalCount
                values {
                    key
                    totalCount
                }
                ...ModalSectionMostVisitedPages_mostVisitedPages
            }
        }
    }
`;

const SectionMostVisitedPages: FC<SectionMostVisitedPagesProps> = ({ queryOptions }) => {
    const { filters } = useDashboard();
    const data = useLazyLoadQuery<SectionMostVisitedPagesQueryType>(
        QUERY,
        getVariablesQuery(filters),
        queryOptions,
    );
    const intl = useIntl();
    const { isOpen, onOpen, onClose } = useDisclosure(false);
    const { mostVisitedPages } = data.analytics;

    if (!mostVisitedPages || mostVisitedPages?.totalCount === 0) return <SectionMostVisitedPagesEmpty />;

    return (
        <>
            <Box as="button" type="button" onClick={onOpen} textAlign="left">
                <Section spacing={6}>
                    <Section.Title>
                        {intl.formatMessage({ id: 'most-visited-pages' })}
                    </Section.Title>

                    {mostVisitedPages.values.slice(0, 3).map((value, idx) => (
                        <ViewChart
                            key={value.key}
                            level={idx + 1}
                            total={mostVisitedPages.totalCount}
                            count={value.totalCount}
                            label={
                                value.key === '/'
                                    ? intl.formatMessage({ id: 'navbar.homepage' })
                                    : `/${formatLabel(value.key)}`
                            }
                        />
                    ))}
                </Section>
            </Box>

            <ModalSectionMostVisitedPages
                show={isOpen}
                onClose={onClose}
                mostVisitedPages={mostVisitedPages}
            />
        </>
    );
};

export default SectionMostVisitedPages;
