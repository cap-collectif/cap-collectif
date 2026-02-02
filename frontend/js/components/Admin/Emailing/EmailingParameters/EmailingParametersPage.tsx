import * as React from 'react'
import type { PreloadedQuery, GraphQLTaggedNode } from 'react-relay'
import { usePreloadedQuery, graphql } from 'react-relay'
import { useIntl } from 'react-intl'
import Flex from '~ui/Primitives/Layout/Flex'
import SectionEmailingService from './SectionEmailingService/SectionEmailingService'
import SectionEmailNotification from './SectionEmailNotification/SectionEmailNotification'
import type { EmailingParametersPageQuery as EmailingParametersPageQueryType } from '~relay/EmailingParametersPageQuery.graphql'
import SectionSendingDomains from '~/components/Admin/Emailing/EmailingParameters/SectionSendingDomains/SectionSendingDomains'
import { headingStyles } from '~ui/Primitives/Heading'
import { FontWeight } from '~ui/Primitives/constants'
import Text from '~ui/Primitives/Text'
import type { FeatureToggles, GlobalState } from '~/types'
import InfoMessage from '~ds/InfoMessage/InfoMessage'
import { useSelector } from 'react-redux'

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
  const { user } = useSelector((state: GlobalState) => state.user)
  const features: FeatureToggles = useSelector((state: GlobalState) => state.default.features)
  const isSuperAdmin = user ? user.isSuperAdmin : false
  return (
    <Flex direction="column">
      <Flex direction="row" justify="space-between" bg="white" py={4} px={6}>
        <Text color="blue.800" {...headingStyles.h4} fontWeight={FontWeight.Semibold}>
          {intl.formatMessage({
            id: 'global.params',
          })}
        </Text>

        {isSuperAdmin && (
          <InfoMessage variant={features?.mailjet_sandbox === true ? 'info' : 'danger'}>
            <InfoMessage.Content>
              {intl.formatMessage({
                id: `emailing-mailjet-sandbox-${features?.mailjet_sandbox === true ? 'on' : 'off'}`,
              })}
              &nbsp;
              <a href="/admin-next/features">Mailjet Sandbox</a>
            </InfoMessage.Content>
          </InfoMessage>
        )}
      </Flex>

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
