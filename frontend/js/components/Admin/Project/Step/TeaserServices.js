// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import SpotIcon, { SPOT_ICON_NAME, SPOT_ICON_SIZE } from '~ds/SpotIcon/SpotIcon';
import Text from '~ui/Primitives/Text';
import Flex from '~ui/Primitives/Layout/Flex';
import { headingStyles } from '~ui/Primitives/Heading';

const TeaserServices = () => {
  const intl = useIntl();

  return (
    <Flex
      direction="column"
      bg="blue.100"
      border="normal"
      borderColor="blue.200"
      p={4}
      borderRadius="normal">
      <Text color="aqua.900" fontWeight="semibold" fontSize={1} lineHeight="sm">
        {intl.formatMessage({ id: 'you-want-to-secure-vote-step' })}
      </Text>
      <Text color="aqua.900" fontSize={1} lineHeight="sm" mb={2}>
        {intl.formatMessage({ id: 'enjoy-following-services' })}
      </Text>

      <Flex direction="row" spacing={1} align="center" mb={2}>
        <SpotIcon name={SPOT_ICON_NAME.SMS} size={SPOT_ICON_SIZE.SM} />
        <Flex direction="column" spacing={1}>
          <Text color="gray.900" fontSize={1} fontWeight="semibold" lineHeight="sm">
            {intl.formatMessage({ id: 'verification-with-sms' })}
          </Text>
          <Text color="gray.900" fontSize={1} lineHeight="sm">
            {intl.formatMessage({ id: 'send-verification-code-sms' })}
          </Text>
        </Flex>
      </Flex>

      <Flex direction="row" spacing={1} align="center" mb={4}>
        <SpotIcon name={SPOT_ICON_NAME.EMAIL_SEND} size={SPOT_ICON_SIZE.SM} />
        <Flex direction="column" spacing={1}>
          <Text color="gray.900" fontSize={1} fontWeight="semibold" lineHeight="sm">
            {intl.formatMessage({ id: 'identification_code' })}
          </Text>
          <Text color="gray.900" fontSize={1} lineHeight="sm">
            {intl.formatMessage({ id: 'send-nominative-identification-code' })}
          </Text>
        </Flex>
      </Flex>

      <Text
        as="a"
        href="/admin-next/securedParticipation"
        target="_blank"
        color="blue.500"
        {...headingStyles.h5}>
        {intl.formatMessage({ id: 'learn.more' })}
      </Text>
    </Flex>
  );
};

export default TeaserServices;
