// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import Text from '~ui/Primitives/Text';

const ProjectPeriod = (): React.Node => {
  const intl = useIntl();

  return (
    <Text color="gray.700">
      {intl.formatMessage(
        { id: 'period-on-project-from-to' },
        {
          projectName: 'l’ensemble des projets pendant la période',
          dateStart: '7 septembre 2020',
          dateEnd: '17 septembre 2020',
        },
      )}
    </Text>
  );
};

export default ProjectPeriod;
