// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import Heading, { headingStyles } from '~ui/Primitives/Heading';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import Button from '~ds/Button/Button';
import SpotIcon, { SPOT_ICON_NAME } from '~ds/SpotIcon/SpotIcon';
import { FontWeight } from '~ui/Primitives/constants';

type Props = {|
  resetErrorBoundary: () => void,
|};

const DashboardError = ({ resetErrorBoundary }: Props): React.Node => {
  const intl = useIntl();

  return (
    <Flex direction="column" spacing="100px">
      <Text
        color="blue.800"
        {...headingStyles.h4}
        fontWeight={FontWeight.Semibold}
        px={6}
        py={4}
        bg="white">
        {intl.formatMessage({ id: 'dashboard-platform' })}
      </Text>

      <Flex direction="column" align="flex-start" width="75%" margin="0 auto">
        <SpotIcon name={SPOT_ICON_NAME.ERROR} size="lg" mb={2} />
        <Heading as="h2" uppercase={false} color="blue.900" mb={2}>
          {intl.formatMessage({ id: 'something-went-wrong' })}
        </Heading>
        <Text {...headingStyles.h4} color="blue.900" mb={8}>
          {intl.formatMessage({ id: 'error-message-dashboard' })}
        </Text>
        <Button
          variant="primary"
          variantColor="primary"
          variantSize="medium"
          onClick={resetErrorBoundary}>
          {intl.formatMessage({ id: 'button.try.again' })}
        </Button>
      </Flex>
    </Flex>
  );
};

export default DashboardError;
