// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { RectShape } from 'react-placeholder/lib/placeholders';
import Flex from '~ui/Primitives/Layout/Flex';
import AppBox from '~ui/Primitives/AppBox';
import Heading from '~ui/Primitives/Heading';
import Text from '~ui/Primitives/Text';

const randomWidth = () => Math.floor(Math.random() * 30) + 10;

const Step = () => {
  return (
    <Flex
      px={2}
      py={3}
      bg="white"
      direction="row"
      spacing={4}
      borderRadius="placeholder"
      align="center">
      <AppBox
        as={RectShape}
        bg="gray.150"
        borderRadius="placeholder"
        style={{ width: '56px', height: '56px', marginRight: 0 }}
      />

      <Flex direction="column" spacing={2} flex={1}>
        <AppBox
          as={RectShape}
          bg="gray.150"
          borderRadius="placeholder"
          style={{ width: `${randomWidth()}%`, height: '24px', marginRight: 0 }}
        />
        <AppBox
          as={RectShape}
          bg="gray.150"
          borderRadius="placeholder"
          style={{ width: `${randomWidth()}%`, height: '16px', marginRight: 0 }}
        />
      </Flex>
    </Flex>
  );
};

const ContributionsPlaceholder = () => {
  const intl = useIntl();

  return (
    <Flex direction="column">
      <Heading as="h4" mb={2} color="blue.900">
        {intl.formatMessage({ id: 'select-a-step' })}
      </Heading>
      <Text color="gray.500" mb={8}>
        {intl.formatMessage({ id: 'consult-all-contrib-on-step' })}
      </Text>

      <Flex direction="column" spacing={4} maxWidth="40%">
        <Step />
        <Step />
      </Flex>
    </Flex>
  );
};

export default ContributionsPlaceholder;
