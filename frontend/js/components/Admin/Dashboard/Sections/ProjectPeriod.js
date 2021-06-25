// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import Text from '~ui/Primitives/Text';
import { useDashboard } from '~/components/Admin/Dashboard/DashboardPage.context';

const ProjectPeriod = (): React.Node => {
  const intl = useIntl();
  const { filters } = useDashboard();

  const projectName =
    filters.projectId === 'ALL'
      ? intl.formatMessage({ id: 'global.the.platform' })
      : intl.formatMessage({ id: 'global.the.project' });
  const dateStart = intl.formatDate(filters.startAt, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const dateEnd = intl.formatDate(filters.endAt, {
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
