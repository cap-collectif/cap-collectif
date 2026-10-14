import { Table } from '@cap-collectif/ui'
import { useLayoutContext } from '@components/BackOffice/Layout/Layout.context'
import { VoiceMessageList_query$key } from '@relay/VoiceMessageList_query.graphql'
import EmptyMessage from '@ui/Table/EmptyMessage'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, usePaginationFragment } from 'react-relay'
import useVoiceMessagePlayer from './useVoiceMessagePlayer'
import { CONNECTION_NODES_PER_PAGE, VoiceMessageStatusFilter } from './utils'
import VoiceMessageItem from './VoiceMessageItem'

const FRAGMENT = graphql`
  fragment VoiceMessageList_query on Query
  @argumentDefinitions(
    status: { type: "ContributionCompletionStatus" }
    first: { type: "Int" }
    cursor: { type: "String" }
  )
  @refetchable(queryName: "VoiceMessageListPaginationQuery") {
    vocals(status: $status, first: $first, after: $cursor)
      @connection(key: "VoiceMessageList_vocals", filters: ["status"]) {
      edges {
        node {
          id
          ...VoiceMessageItem_vocal
        }
      }
    }
  }
`

type Props = {
  queryReference: VoiceMessageList_query$key
}

const VoiceMessageList: React.FC<Props> = ({ queryReference }) => {
  const intl = useIntl()
  const { contentRef } = useLayoutContext()
  const { data, loadNext, hasNext, refetch } = usePaginationFragment(FRAGMENT, queryReference)
  const { playingId, toggle } = useVoiceMessagePlayer()
  const [status, setStatus] = React.useState<VoiceMessageStatusFilter>('ALL')
  const [isFiltering, setIsFiltering] = React.useState(false)
  const vocals = (data.vocals.edges ?? [])
    .map(edge => edge?.node)
    .filter((node): node is NonNullable<typeof node> => Boolean(node))

  const onStatusChange = (value: VoiceMessageStatusFilter) => {
    setStatus(value)
    setIsFiltering(true)
    refetch(
      { status: value === 'ALL' ? null : value, first: CONNECTION_NODES_PER_PAGE },
      { onComplete: () => setIsFiltering(false) },
    )
  }

  const statusOptions: Array<{ value: VoiceMessageStatusFilter; label: string }> = [
    { value: 'ALL', label: intl.formatMessage({ id: 'global.select_statuses' }) },
    { value: 'COMPLETED', label: intl.formatMessage({ id: 'admin.voice-messages.status.completed' }) },
    {
      value: 'MISSING_REQUIREMENTS',
      label: intl.formatMessage({ id: 'admin.voice-messages.status.missing-requirements' }),
    },
  ]

  return (
    <Table
      emptyMessage={<EmptyMessage onReset={() => onStatusChange('ALL')} />}
      isLoading={isFiltering}
      style={{ border: 'none' }}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th noPlaceholder lineHeight="sm">
            <Table.Menu label={intl.formatMessage({ id: 'global.status' })}>
              <Table.Menu.OptionGroup
                value={status}
                onChange={value => onStatusChange(value as VoiceMessageStatusFilter)}
                type="radio"
                title={intl.formatMessage({ id: 'action_show' })}
              >
                {statusOptions.map(option => (
                  <Table.Menu.OptionItem key={option.value} value={option.value}>
                    {option.label}
                  </Table.Menu.OptionItem>
                ))}
              </Table.Menu.OptionGroup>
            </Table.Menu>
          </Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'admin.voice-messages.created-at' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'admin.voice-messages.author' })}</Table.Th>
          <Table.Th lineHeight="sm" display="flex" justifyContent="center"></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody
        useInfiniteScroll={vocals.length > 0}
        onScrollToBottom={() => loadNext(CONNECTION_NODES_PER_PAGE)}
        hasMore={hasNext}
        scrollParentRef={contentRef || undefined}
      >
        {vocals.map(vocal => (
          <Table.Tr key={vocal.id} rowId={vocal.id}>
            <VoiceMessageItem vocal={vocal} isPlaying={playingId === vocal.id} onTogglePlay={toggle} />
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default VoiceMessageList
