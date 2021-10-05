// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import Text from '~ui/Primitives/Text';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import { headingStyles } from '~ui/Primitives/Heading';

type Props = {|
  +onReset: () => void,
|};

const EmptyMessage = ({ onReset }: Props) => {
  const intl = useIntl();

  return (
    <Flex direction="column" px={6} py={12} spacing={2} width="100%">
      <Text color="blue.900" {...headingStyles.h3}>
        {intl.formatMessage({ id: 'no-result-found' })}
      </Text>
      <Text color="blue.900" {...headingStyles.h4}>
        {intl.formatMessage({ id: 'adjust-search-filters-to-find' })}
      </Text>
      <Button variant="tertiary" variantColor="primary" onClick={onReset}>
        {intl.formatMessage({ id: 'clean-search-and-filters' })}
      </Button>
    </Flex>
  );
};

export default EmptyMessage;
