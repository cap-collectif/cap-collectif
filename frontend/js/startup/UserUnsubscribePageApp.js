// @flow
import React, { Suspense } from 'react';
import { FormattedMessage } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Link from '~ds/Link/Link';
import Providers from '~/startup/Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';
import Image from '~ui/Medias/Image';
import colors from '~/styles/modules/colors';
import Heading from '~ui/Primitives/Heading';
import Text from '~ui/Primitives/Text';

export type UserUnsubscribePageAppProps = {|
  +logoUrl: string,
  +platformName: string,
  +redirectUrl: string,
|};

export default (propsComponent: UserUnsubscribePageAppProps) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <Flex direction="column" align="center" justify="center" width="100%" height="100%">
        <Flex direction="column" spacing={10} p={8} bg="white" borderRadius="normal" maxWidth="50%">
          <Image width="140" src={propsComponent.logoUrl} alt="logo plateforme" />
          <Flex direction="column" spacing={6}>
            <Heading as="h3" style={{ color: colors.gray[900] }}>
              <FormattedMessage id="unsubscribe.page.title" />
            </Heading>
            <Text style={{ color: colors.gray[700] }}>
              <FormattedMessage
                id="unsubscribe.page.body"
                values={{ siteName: propsComponent.platformName }}
              />
            </Text>
            <Text>
              <Link href={propsComponent.redirectUrl} style={{ color: colors.gray[700] }}>
                <FormattedMessage id="unsubscribe.page.link" />
              </Link>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Providers>
  </Suspense>
);
