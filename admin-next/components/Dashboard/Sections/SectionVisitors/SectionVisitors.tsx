import type { FC } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useIntl } from 'react-intl';
import { Box } from '@cap-collectif/ui';
import { useDisclosure } from '@liinkiing/react-hooks';
import SmallChart from '@ui/Charts/SmallChart/SmallChart';
import type { SectionVisitorsQuery as SectionVisitorsQueryType } from '@relay/SectionVisitorsQuery.graphql';
import formatValues from '../../formatValues';
import ModalSectionVisitors from './ModalSectionVisitors';
import { useDashboard } from '../../Dashboard.context';
import { getVariablesQuery, QueryOptions } from '../Sections.utils';

interface SectionVisitorsProps {
    readonly queryOptions: QueryOptions
}

const QUERY = graphql`
    query SectionVisitorsQuery($filter: QueryAnalyticsFilter!) {
        analytics(filter: $filter) {
            visitors {
                totalCount
                values {
                    key
                    totalCount
                }
                ...ModalSectionVisitors_visitors
            }
        }
    }
`;

const SectionVisitors: FC<SectionVisitorsProps> = ({ queryOptions }) => {
    const { filters } = useDashboard();
    const data = useLazyLoadQuery<SectionVisitorsQueryType>(QUERY, getVariablesQuery(filters), queryOptions);
    const intl = useIntl();
    const { isOpen, onOpen, onClose } = useDisclosure(false);
    const { visitors } = data.analytics;

    return (
        <>
            <Box
                as="button"
                type="button"
                onClick={onOpen}
                flex={1}
                maxWidth="33%">
                <SmallChart
                    count={visitors?.totalCount || 0}
                    label={intl.formatMessage(
                        { id: 'global.visitor.dynamic' },
                        { num: visitors?.totalCount || 0 },
                    )}
                    data={visitors ? formatValues(visitors.values, intl) : []}
                />
            </Box>

            {visitors && <ModalSectionVisitors show={isOpen} onClose={onClose} visitors={visitors}/>}
        </>
    );
};

export default SectionVisitors;
