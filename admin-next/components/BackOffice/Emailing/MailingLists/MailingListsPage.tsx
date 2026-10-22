import { CapUISpotIcon, CapUISpotIconSize, Flex, Heading, InfoMessage, Search, SpotIcon, Text } from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import type { MailingListsPageQuery } from '@relay/MailingListsPageQuery.graphql'
import debounce from '@shared/utils/debounce-promise'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import EmailingHelpLink from '../EmailingHelpLink'
import MailjetSandboxMessage from '../MailjetSandboxMessage'
import { CONNECTION_NODES_PER_PAGE } from '../utils'
import MailingListList from './MailingListList'

const QUERY = graphql`
  query MailingListsPageQuery($count: Int!, $affiliations: [MailingListAffiliation!]) {
    viewer {
      allMailingLists: mailingLists(affiliations: $affiliations) {
        totalCount
      }
      ...MailingListList_mailingListOwner @arguments(count: $count, affiliations: $affiliations)
      organizations {
        allMailingLists: mailingLists(affiliations: $affiliations) {
          totalCount
        }
        ...MailingListList_mailingListOwner @arguments(count: $count, affiliations: $affiliations)
      }
    }
  }
`

const MailingListsNoResult: React.FC = () => {
  const intl = useIntl()

  return (
    <Flex direction="row" spacing={8} bg="white" py="96px" px="111px" borderRadius="normal">
      <SpotIcon name={CapUISpotIcon.EMAIL_SEND} size={CapUISpotIconSize.Lg} />
      <Flex direction="column" color="blue.900" align="flex-start" width="300px">
        <Heading as="h3" mb={2}>
          {intl.formatMessage({ id: 'empty.mailingList' })}
        </Heading>
        <Text>{intl.formatMessage({ id: 'empty.mailingList.indication' })}</Text>
      </Flex>
    </Flex>
  )
}

const MailingListsPage: React.FC = () => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const [term, setTerm] = React.useState('')
  const onTermChange = debounce((value: string) => setTerm(value), 400)

  const { viewer } = useLazyLoadQuery<MailingListsPageQuery>(QUERY, {
    count: CONNECTION_NODES_PER_PAGE,
    affiliations: viewerSession.isAdmin ? null : ['OWNER'],
  })
  // An organization member manages the mailing lists of its organization
  const organization = viewer.organizations?.[0]
  const owner = organization ?? viewer
  const hasMailingLists = owner.allMailingLists.totalCount > 0

  return (
    <Flex direction="column" spacing={6}>
      <MailjetSandboxMessage />
      {hasMailingLists ? (
        <Flex direction="column" p={8} spacing={4} bg="white" borderRadius="normal" overflow="hidden">
          <Flex direction="row" spacing={6} align="center">
            <Search
              id="search-mailing-list"
              onChange={onTermChange}
              value={term}
              placeholder={intl.formatMessage({ id: 'admin.mailing-lists.search' })}
              aria-label={intl.formatMessage({ id: 'admin.mailing-lists.search' })}
            />
            <EmailingHelpLink helpLabel="about-mailing-list" />
          </Flex>
          <InfoMessage variant="info">
            <InfoMessage.Title>{intl.formatMessage({ id: 'mailingList-update' })}</InfoMessage.Title>
            <InfoMessage.Content>{intl.formatMessage({ id: 'mailingList-update-beta' })}</InfoMessage.Content>
          </InfoMessage>
          <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={3} />}>
            <MailingListList mailingListOwner={owner} term={term} resetTerm={() => setTerm('')} />
          </React.Suspense>
        </Flex>
      ) : (
        <>
          <EmailingHelpLink helpLabel="about-mailing-list" />
          <MailingListsNoResult />
        </>
      )}
    </Flex>
  )
}

export default MailingListsPage
