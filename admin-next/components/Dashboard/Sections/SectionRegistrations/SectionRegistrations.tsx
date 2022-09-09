import type { FC } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useIntl } from 'react-intl';
import { useDisclosure } from '@liinkiing/react-hooks';
import SmallChart from '@ui/Charts/SmallChart/SmallChart';
import type { SectionRegistrationsQuery as SectionRegistrationsQueryType } from '@relay/SectionRegistrationsQuery.graphql';
import formatValues from '../../formatValues';
import { Box } from '@cap-collectif/ui';
import ModalSectionRegistrations from './ModalSectionRegistrations';
import { useDashboard } from '../../Dashboard.context';
import { getVariablesQuery, QueryOptions } from '../Sections.utils';

interface SectionRegistrationsProps {
    readonly queryOptions: QueryOptions
}

const QUERY = graphql`
    query SectionRegistrationsQuery($filter: QueryAnalyticsFilter!) {
        analytics(filter: $filter) {
            registrations {
                totalCount
                values {
                    key
                    totalCount
                }
                ...ModalSectionRegistrations_registrations
            }
        }
    }
`;

const SectionRegistrations: FC<SectionRegistrationsProps> = ({ queryOptions }) => {
    const { filters } = useDashboard();
    const data = useLazyLoadQuery<SectionRegistrationsQueryType>(QUERY, getVariablesQuery(filters), queryOptions);
    const intl = useIntl();
    const { isOpen, onOpen, onClose } = useDisclosure(false);
    const { registrations } = data.analytics;

    return (
        <>
            <Box
                as="button"
                type="button"
                onClick={onOpen}
                flex={1}
                maxWidth="33%">
                <SmallChart
                    count={registrations?.totalCount || 0}
                    label={intl.formatMessage(
                        { id: 'global.registration.dynamic' },
                        { num: registrations?.totalCount || 0 },
                    )}
                    data={registrations ? formatValues(registrations.values, intl) : []}
                />
            </Box>

            {registrations && <ModalSectionRegistrations
                show={isOpen}
                onClose={onClose}
                registrations={registrations}
            />}
        </>
    );
};

export default SectionRegistrations;
