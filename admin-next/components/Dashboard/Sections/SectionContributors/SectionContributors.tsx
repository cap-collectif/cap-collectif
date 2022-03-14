import type { FC } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useIntl } from 'react-intl';
import { useDisclosure } from '@liinkiing/react-hooks';
import SmallChart from '@ui/Charts/SmallChart/SmallChart';
import formatValues from '../../formatValues';
import ModalSectionContributors from './ModalSectionContributors';
import { Box } from '@cap-collectif/ui';
import { useDashboard } from '../../Dashboard.context';
import { SectionContributorsQuery as SectionContributorsQueryType } from '@relay/SectionContributorsQuery.graphql';
import { getVariablesQuery, QueryOptions } from '../Sections.utils';

interface SectionContributorsProps {
    readonly queryOptions: QueryOptions
};

const QUERY = graphql`
    query SectionContributorsQuery($filter: QueryAnalyticsFilter!) {
        analytics(filter: $filter) {
            contributors {
                totalCount
                values {
                    key
                    totalCount
                }
                ...ModalSectionContributors_contributors
            }
            anonymousContributors {
                totalCount
                values {
                    key
                    totalCount
                }
                ...ModalSectionContributors_anonymousContributors
            }
        }
    }
`;

const SectionContributors: FC<SectionContributorsProps> = ({
  queryOptions,
}) => {
    const { filters } = useDashboard();
    const data = useLazyLoadQuery<SectionContributorsQueryType>(QUERY, getVariablesQuery(filters), queryOptions);

    const intl = useIntl();
    const { isOpen, onOpen, onClose } = useDisclosure(false);
    const { contributors, anonymousContributors } = data.analytics;

    const totalContributorsCount = (contributors?.totalCount || 0) + (anonymousContributors?.totalCount || 0);
    const totalContributorsValues = [...contributors?.values || [], ...anonymousContributors?.values || []];

    return (
        <>
          <Box
            as="button"
            type="button"
            onClick={onOpen}
            width="25%"
            maxWidth="25%">
            <SmallChart
              count={totalContributorsCount}
              label={intl.formatMessage(
                { id: 'global.contributor.dynamic' },
                { num: totalContributorsCount },
              )}
              data={formatValues(totalContributorsValues, intl)}
            />
          </Box>

          <ModalSectionContributors
            show={isOpen}
            onClose={onClose}
            anonymousContributors={anonymousContributors || null}
            contributors={contributors || null}
          />
        </>
    );
};

export default SectionContributors;
