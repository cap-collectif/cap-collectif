import type { FC } from 'react';
import { Text } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { useDashboard } from './Dashboard.context';

const ProjectPeriod: FC = () => {
    const intl = useIntl();
    const { filters } = useDashboard();

    const projectName =
        filters.projectId === 'ALL'
            ? intl.formatMessage({ id: 'global.the.platform' })
            : intl.formatMessage({ id: 'global.the.project' });
    const dateStart = intl.formatDate(filters.dateRange.startAt, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const dateEnd = intl.formatDate(filters.dateRange.endAt, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <Text color="gray.700">
            {intl.formatMessage(
                { id: 'period-on-project-from-to' },
                {
                    projectName,
                    dateStart,
                    dateEnd,
                },
            )}
        </Text>
    );
};

export default ProjectPeriod;
