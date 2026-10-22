import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment, usePaginationFragment } from 'react-relay'
import { Box, Button, CapUIIcon, Flex, Icon, InlineSelect, Table, Text } from '@cap-collectif/ui'
import EmptyMessage from '@ui/Table/EmptyMessage'
import { useLayoutContext } from '@components/BackOffice/Layout/Layout.context'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import type { EmailingCampaignList_emailingCampaignOwner$key } from '@relay/EmailingCampaignList_emailingCampaignOwner.graphql'
import type { EmailingCampaignList_viewer$key } from '@relay/EmailingCampaignList_viewer.graphql'
import { CONNECTION_NODES_PER_PAGE } from '../utils'
import EmailingCampaignItem from './EmailingCampaignItem'
import DeleteEmailingCampaignsModal from './DeleteEmailingCampaignsModal'

export const FRAGMENT = graphql`
  fragment EmailingCampaignList_emailingCampaignOwner on EmailingCampaignOwner
  @argumentDefinitions(
    count: { type: "Int!" }
    cursor: { type: "String" }
    term: { type: "String", defaultValue: null }
    orderBy: { type: "EmailingCampaignOrder", defaultValue: { field: SEND_AT, direction: DESC } }
    status: { type: "EmailingCampaignStatusFilter", defaultValue: null }
    affiliations: { type: "[EmailingCampaignAffiliation!]" }
  )
  @refetchable(queryName: "EmailingCampaignListPaginationQuery") {
    campaignsAll: emailingCampaigns(status: null, affiliations: $affiliations) {
      totalCount
    }
    campaignsSent: emailingCampaigns(status: SENT, affiliations: $affiliations) {
      totalCount
    }
    campaignsPlanned: emailingCampaigns(status: PLANNED, affiliations: $affiliations) {
      totalCount
    }
    campaignsDraft: emailingCampaigns(status: DRAFT, affiliations: $affiliations) {
      totalCount
    }
    emailingCampaigns(
      first: $count
      after: $cursor
      term: $term
      orderBy: $orderBy
      status: $status
      affiliations: $affiliations
    )
      @connection(
        key: "EmailingCampaignList_emailingCampaigns"
        filters: ["term", "orderBy", "status", "affiliations"]
      ) {
      totalCount
      edges {
        node {
          id
          creator {
            id
          }
          ...EmailingCampaignItem_emailingCampaign
        }
      }
    }
  }
`

const VIEWER_FRAGMENT = graphql`
  fragment EmailingCampaignList_viewer on User {
    id
    isAdminOrganization
    organizations {
      id
    }
  }
`

type StatusFilter = 'ALL' | 'SENT' | 'PLANNED' | 'DRAFT'
type Direction = 'ASC' | 'DESC'

type Props = {
  readonly emailingCampaignOwner: EmailingCampaignList_emailingCampaignOwner$key
  readonly viewer: EmailingCampaignList_viewer$key
  readonly term: string
  readonly resetTerm: () => void
}

const EmailingCampaignList: React.FC<Props> = ({ emailingCampaignOwner, viewer: viewerRef, term, resetTerm }) => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const { contentRef } = useLayoutContext()
  const viewer = useFragment(VIEWER_FRAGMENT, viewerRef)
  const { data, loadNext, hasNext, refetch } = usePaginationFragment(FRAGMENT, emailingCampaignOwner)
  const [status, setStatus] = React.useState<StatusFilter>('ALL')
  const [direction, setDirection] = React.useState<Direction>('DESC')
  const [campaignIdsToDelete, setCampaignIdsToDelete] = React.useState<string[]>([])
  const firstRendered = React.useRef<true | null>(null)

  const refetchList = React.useCallback(() => {
    refetch(
      {
        term: term || null,
        status: status === 'ALL' ? null : status,
        orderBy: { field: 'SEND_AT', direction },
        affiliations: viewerSession.isAdmin ? null : ['OWNER'],
      },
      { fetchPolicy: 'network-only' },
    )
  }, [refetch, term, status, direction, viewerSession.isAdmin])

  React.useEffect(() => {
    if (firstRendered.current) refetchList()
    firstRendered.current = true
  }, [refetchList])

  const resetFilters = () => {
    setStatus('ALL')
    setDirection('DESC')
    resetTerm()
  }

  const campaigns = (data.emailingCampaigns.edges ?? [])
    .map(edge => edge?.node)
    .filter((campaign): campaign is NonNullable<typeof campaign> => Boolean(campaign))

  // Within an organization, only its admins can delete the campaigns created by other members
  const canDelete = (selectedRows: string[]) =>
    (viewer.organizations?.length ?? 0) === 0 ||
    viewer.isAdminOrganization ||
    selectedRows.every(id => campaigns.find(campaign => campaign.id === id)?.creator?.id === viewer.id)

  return (
    <Flex direction="column" spacing={4}>
      <InlineSelect value={status} onChange={value => setStatus(value as StatusFilter)}>
        <InlineSelect.Choice value="ALL">
          {intl.formatMessage({ id: 'filter.count.status.all' }, { num: data.campaignsAll.totalCount })}
        </InlineSelect.Choice>
        <InlineSelect.Choice value="SENT">
          {intl.formatMessage({ id: 'filter.count.status.sent' }, { num: data.campaignsSent.totalCount })}
        </InlineSelect.Choice>
        <InlineSelect.Choice value="PLANNED">
          {intl.formatMessage({ id: 'filter.count.status.planned' }, { num: data.campaignsPlanned.totalCount })}
        </InlineSelect.Choice>
        <InlineSelect.Choice value="DRAFT">
          {intl.formatMessage({ id: 'filter.count.status.draft' }, { num: data.campaignsDraft.totalCount })}
        </InlineSelect.Choice>
      </InlineSelect>

      <Table
        selectable
        emptyMessage={<EmptyMessage onReset={resetFilters} />}
        style={{ border: 'none' }}
        onReset={resetFilters}
        actionBar={({ selectedRows }) => (
          <>
            <Box as="span">
              {intl.formatMessage({ id: 'admin-opinions-list-selected' }, { itemCount: selectedRows.length })}
            </Box>
            {canDelete(selectedRows) ? (
              <Button variant="secondary" variantColor="danger" onClick={() => setCampaignIdsToDelete(selectedRows)}>
                {intl.formatMessage({ id: 'admin.global.delete' })}
              </Button>
            ) : null}
          </>
        )}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.name' })}</Table.Th>
            <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.status' })}</Table.Th>
            <Table.Th lineHeight="sm">
              <Table.Menu label={intl.formatMessage({ id: 'sending-date' })}>
                <Table.Menu.OptionGroup
                  value={direction}
                  onChange={value => setDirection(value as Direction)}
                  type="radio"
                  title={intl.formatMessage({ id: 'sort-by' })}
                >
                  <Table.Menu.OptionItem value="DESC">
                    <Text>{intl.formatMessage({ id: 'global.filter_f_last' })}</Text>
                    <Icon ml="auto" name={CapUIIcon.ArrowDownO} />
                  </Table.Menu.OptionItem>
                  <Table.Menu.OptionItem value="ASC">
                    <Text>{intl.formatMessage({ id: 'global.filter_f_old' })}</Text>
                    <Icon ml="auto" name={CapUIIcon.ArrowUpO} />
                  </Table.Menu.OptionItem>
                </Table.Menu.OptionGroup>
              </Table.Menu>
            </Table.Th>
            <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'recipient' })}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody
          useInfiniteScroll={campaigns.length > 0}
          onScrollToBottom={() => loadNext(CONNECTION_NODES_PER_PAGE)}
          hasMore={hasNext}
          scrollParentRef={contentRef || undefined}
        >
          {campaigns.map(campaign => (
            <Table.Tr key={campaign.id} rowId={campaign.id}>
              <EmailingCampaignItem emailingCampaign={campaign} />
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {campaignIdsToDelete.length > 0 ? (
        <DeleteEmailingCampaignsModal
          campaignIds={campaignIdsToDelete}
          onClose={() => setCampaignIdsToDelete([])}
          onDeleted={refetchList}
        />
      ) : null}
    </Flex>
  )
}

export default EmailingCampaignList
