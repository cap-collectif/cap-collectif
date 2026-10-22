import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, usePaginationFragment } from 'react-relay'
import { Button, CapUIIcon, CapUIIconSize, Flex, Icon, Table, Text, Tooltip } from '@cap-collectif/ui'
import EmptyMessage from '@ui/Table/EmptyMessage'
import { useLayoutContext } from '@components/BackOffice/Layout/Layout.context'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import type { MailingListList_mailingListOwner$key } from '@relay/MailingListList_mailingListOwner.graphql'
import MembersModal from '../Members/MembersModal'
import { CONNECTION_NODES_PER_PAGE } from '../utils'

export const FRAGMENT = graphql`
  fragment MailingListList_mailingListOwner on MailingListOwner
  @argumentDefinitions(
    count: { type: "Int!" }
    cursor: { type: "String" }
    term: { type: "String", defaultValue: null }
    affiliations: { type: "[MailingListAffiliation!]" }
  )
  @refetchable(queryName: "MailingListListPaginationQuery") {
    mailingLists(first: $count, after: $cursor, term: $term, affiliations: $affiliations)
      @connection(key: "MailingListList_mailingLists", filters: ["term", "affiliations"]) {
      totalCount
      edges {
        node {
          id
          name
          project {
            title
          }
          usersConsenting: users(consentInternalCommunicationOnly: true) {
            totalCount
          }
        }
      }
    }
  }
`

type Props = {
  readonly mailingListOwner: MailingListList_mailingListOwner$key
  readonly term: string
  readonly resetTerm: () => void
}

const MailingListList: React.FC<Props> = ({ mailingListOwner, term, resetTerm }) => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const { contentRef } = useLayoutContext()
  const { data, loadNext, hasNext, refetch } = usePaginationFragment(FRAGMENT, mailingListOwner)
  const firstRendered = React.useRef<true | null>(null)

  React.useEffect(() => {
    if (firstRendered.current) {
      refetch({ term: term || null, affiliations: viewerSession.isAdmin ? null : ['OWNER'] })
    }

    firstRendered.current = true
  }, [term, refetch, viewerSession.isAdmin])

  const mailingLists = (data.mailingLists?.edges ?? [])
    .map(edge => edge?.node)
    .filter((mailingList): mailingList is NonNullable<typeof mailingList> => Boolean(mailingList))

  return (
    <Table emptyMessage={<EmptyMessage onReset={resetTerm} />} style={{ border: 'none' }} onReset={resetTerm}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.name' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.project' })}</Table.Th>
          <Table.Th lineHeight="sm">
            <Flex align="center" spacing={1}>
              <Text>{intl.formatMessage({ id: 'admin.fields.group.number_users' })}</Text>
              <Tooltip label={intl.formatMessage({ id: 'has-consent-to-internal-email' }, { num: 2 })}>
                <Flex>
                  <Icon name={CapUIIcon.Info} size={CapUIIconSize.Sm} color="blue.500" />
                </Flex>
              </Tooltip>
            </Flex>
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody
        useInfiniteScroll={mailingLists.length > 0}
        onScrollToBottom={() => loadNext(CONNECTION_NODES_PER_PAGE)}
        hasMore={hasNext}
        scrollParentRef={contentRef || undefined}
      >
        {mailingLists.map(mailingList => (
          <Table.Tr key={mailingList.id} rowId={mailingList.id}>
            <Table.Td>
              <MembersModal
                recipient={{ type: 'MAILING_LIST', id: mailingList.id, name: mailingList.name }}
                disclosure={
                  <Button variant="link" variantColor="primary" aria-haspopup="dialog">
                    {mailingList.name}
                  </Button>
                }
              />
            </Table.Td>
            <Table.Td>{mailingList.project?.title ?? null}</Table.Td>
            <Table.Td>
              <Flex align="center" spacing={1}>
                <Icon name={CapUIIcon.UserO} size={CapUIIconSize.Md} color="gray.500" />
                <Text>
                  {mailingList.usersConsenting.totalCount}{' '}
                  {intl.formatMessage({ id: 'global.members' }, { num: mailingList.usersConsenting.totalCount })}
                </Text>
              </Flex>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default MailingListList
