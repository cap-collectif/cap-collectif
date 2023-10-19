import * as React from 'react'
import { useIntl } from 'react-intl'
import type { PreloadedQuery, GraphQLTaggedNode } from 'react-relay'
import { usePreloadedQuery, graphql } from 'react-relay'
import Flex from '~ui/Primitives/Layout/Flex'
import SectionEmailingService from './SectionEmailingService/SectionEmailingService'
import SectionEmailNotification from './SectionEmailNotification/SectionEmailNotification'
import type { EmailingParametersPageQuery as EmailingParametersPageQueryType } from '~relay/EmailingParametersPageQuery.graphql'
import SectionSendingDomains from '~/components/Admin/Emailing/EmailingParameters/SectionSendingDomains/SectionSendingDomains'
import { headingStyles } from '~ui/Primitives/Heading'
import { FontWeight } from '~ui/Primitives/constants'
import Text from '~ui/Primitives/Text'

type Props = {
  queryReference: PreloadedQuery<EmailingParametersPageQueryType>
}
export const EmailingParametersPageQuery: GraphQLTaggedNode = graphql`
  query EmailingParametersPageQuery($type: ExternalServiceConfigurationType!) {
    externalServiceConfiguration(type: $type) {
      ...SectionEmailingService_externalServiceConfiguration
    }
    senderEmailDomains {
      ...SectionSendingDomains_senderEmailDomains
    }
    senderEmails {
      id
      isDefault
      ...SectionSendingDomains_senderEmails
    }
    receiveAddress: siteParameter(keyname: "admin.mail.notifications.receive_address") {
      value
    }
    senderName: siteParameter(keyname: "admin.mail.notifications.send_name") {
      value
    }
    ...SectionEmailNotification_query
  }
`

const EmailingParametersPage = ({ queryReference }: Props): JSX.Element => {
  const intl = useIntl()
  const query = usePreloadedQuery<EmailingParametersPageQueryType>(EmailingParametersPageQuery, queryReference)
  const defaultSenderEmail = query.senderEmails.find(senderEmail => senderEmail.isDefault)
  return (
    <Flex direction="column">
      <Text color="blue.800" {...headingStyles.h4} fontWeight={FontWeight.Semibold} px={6} py={4} bg="white">
        {intl.formatMessage({
          id: 'global.params',
        })}
      </Text>

      <Flex direction="column" spacing={6} p={6}>
        <SectionEmailingService externalServiceConfiguration={query.externalServiceConfiguration} />
        <SectionEmailNotification
          query={query}
          initialValues={{
            'recipient-email': query.receiveAddress?.value || '',
            'sender-email': defaultSenderEmail?.id || '',
            'sender-name': query.senderName?.value || '',
          }}
        />
        <SectionSendingDomains senderEmailDomains={query.senderEmailDomains} senderEmails={query.senderEmails} />
      </Flex>
    </Flex>
  )
}

export default EmailingParametersPage
