// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { LineHeight } from '~ui/Primitives/constants';
import AppBox from '~ui/Primitives/AppBox';
import Heading from '~ui/Primitives/Heading';
import Text from '~ui/Primitives/Text';
import Button from '~ds/Button/Button';

const DashboardEmptyState = (): React.Node => {
  const intl = useIntl();

  return (
    <AppBox pl={14} pt={14} width="100%" height="100vh" backgroundColor="gray.100">
      <Heading as="h1" color="blue.900" fontSize={7} mb={5} lineHeight={LineHeight.XL}>
        {intl.formatMessage({ id: 'project.stats.title' })}
      </Heading>
      <AppBox width="50%" mb={8} color="blue.900" fontSize={4}>
        <Text mb={4}>
          {intl.formatMessage({ id: 'this-is-where-you-can-check-analysis-data' })}
        </Text>
        <Text>{intl.formatMessage({ id: 'must-create-project-before-analysis' })}</Text>
      </AppBox>
      <Button
        variant="primary"
        variantSize="big"
        onClick={() => window.open('/admin/capco/app/project/list', '_self')}>
        {intl.formatMessage({ id: 'create-a-project' })}
      </Button>
    </AppBox>
  );
};

export default DashboardEmptyState;
