// @flow
import * as React from 'react';
import {
  usePreloadedQuery,
  graphql,
  type PreloadedQuery,
  type GraphQLTaggedNode,
} from 'react-relay';
import Flex from '~ui/Primitives/Layout/Flex';
import SectionEmailingService from './SectionEmailingService/SectionEmailingService';
import SectionEmailNotification from './SectionEmailNotification/SectionEmailNotification';
import type { EmailingParametersPageQuery as EmailingParametersPageQueryType } from '~relay/EmailingParametersPageQuery.graphql';
import SectionSendingDomains from '~/components/Admin/Emailing/EmailingParameters/SectionSendingDomains/SectionSendingDomains';

type Props = {|
  queryReference: PreloadedQuery<EmailingParametersPageQueryType>,
|};

export const EmailingParametersPageQuery: GraphQLTaggedNode = graphql`
  query EmailingParametersPageQuery($type: ExternalServiceConfigurationType!) {
    externalServiceConfiguration(type: $type) {
      ...SectionEmailingService_externalServiceConfiguration
    }
    senderEmailDomains {
      ...SectionSendingDomains_senderEmailDomains
    }
  }
`;

const EmailingParametersPage = ({ queryReference }: Props): React.Node => {
  const query = usePreloadedQuery<EmailingParametersPageQueryType>(
    EmailingParametersPageQuery,
    queryReference,
  );

  return (
    <Flex direction="column" spacing={6} p={6}>
      <SectionEmailingService externalServiceConfiguration={query.externalServiceConfiguration} />
      <SectionEmailNotification
        initialValues={{
          'recipient-email': 'admin@cap-collectif.com',
          'sender-email': 'admin@cap-collectif.com',
          'sender-name': 'Cap Collectif',
        }}
      />
      <SectionSendingDomains senderEmailDomains={query.senderEmailDomains} />
    </Flex>
  );
};

export default EmailingParametersPage;
