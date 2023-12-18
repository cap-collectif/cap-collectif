import * as React from 'react'
import { graphql, usePaginationFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import type { ParticipantList_mediator$key } from '@relay/ParticipantList_mediator.graphql'
import { Text, Table, ButtonQuickAction, CapUIIcon, Tag, Icon } from '@cap-collectif/ui'
import EmptyMessage from 'components/UI/Table/EmptyMessage'
import { ParticipantListPaginationQuery, OrderDirection } from '@relay/ParticipantListPaginationQuery.graphql'
import moment from 'moment'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import { MediatorVoteModalEdit, ParticipantInfos } from './MediatorVoteModal/MediatorVoteModal'
import ModalSkeleton from './MediatorVoteModal/ModalSkeleton'
import { useLayoutContext } from '@components/Layout/Layout.context'
import DeleteParticipantModal from "./DeleteParticipantModal";

export const ParticipantListFragment = graphql`
  fragment ParticipantList_mediator on Mediator
  @argumentDefinitions(
    count: { type: "Int!" }
    cursor: { type: "String" }
    term: { type: "String", defaultValue: null }
    mediatorId: { type: "ID!" }
    orderBy: { type: ParticipantOrder }
  )
  @refetchable(queryName: "ParticipantListPaginationQuery") {
    id
    ...DeleteParticipantModal_mediator
    participants(first: $count, after: $cursor, fullname: $term, orderBy: $orderBy)
      @connection(key: "ParticipantList_participants", filters: ["query", "fullname", "orderBy"]) {
      totalCount
      __id
      edges {
        node {
          token
          id
          createdAt
          firstname
          lastname
          email
          votes(mediatorId: $mediatorId) {
            edges {
              node {
                id
                isAccounted
              }
            }
          }
          ...DeleteParticipantModal_participant
        }
      }
    }
  }
`

interface ParticipantListProps {
  mediator: ParticipantList_mediator$key
  resetTerm: () => void
  term: string
  stepId: string
  orderBy: OrderDirection
  setOrderBy: (OrderDirection) => void
}

const ParticipantList: React.FC<ParticipantListProps> = ({
  mediator: mediatorRef,
  resetTerm,
  term,
  stepId,
  orderBy,
  setOrderBy,
}) => {
  const intl = useIntl()
  const firstRendered = React.useRef<boolean | null>(null)
  const { data, loadNext, hasNext, refetch } = usePaginationFragment<
    ParticipantListPaginationQuery,
    ParticipantList_mediator$key
  >(ParticipantListFragment, mediatorRef)
  const [selectedParticipant, setSelectedParticipant] = React.useState<null | ParticipantInfos>(null)
  const { contentRef } = useLayoutContext()

  React.useEffect(() => {
    if (firstRendered.current) {
      refetch({
        term: term || null,
        orderBy: { field: 'CREATED_AT', direction: orderBy as OrderDirection },
      })
    }
    firstRendered.current = true
  }, [term, refetch, orderBy])

  return (
    <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={5} />}>
      {selectedParticipant ? (
        <React.Suspense fallback={<ModalSkeleton />}>
          <MediatorVoteModalEdit
            stepId={stepId}
            onClose={() => setSelectedParticipant(null)}
            participantId={selectedParticipant.id}
            token={selectedParticipant.token}
            mediatorId={data.id}
            username={term}
            orderBy={orderBy}
          />
        </React.Suspense>
      ) : null}
      <Table emptyMessage={<EmptyMessage onReset={resetTerm} />}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Text lineHeight="sm">
                {intl.formatMessage({ id: 'global.counters.contributors' }, { num: data?.participants?.totalCount })}
              </Text>
            </Table.Th>
            <Table.Th>
              <Text lineHeight="sm">{intl.formatMessage({ id: 'mediator.participation' })}</Text>
            </Table.Th>
            <Table.Th>
              <Text lineHeight="sm">{intl.formatMessage({ id: 'global.email.short' })}</Text>
            </Table.Th>
            <Table.Th>
              <Table.Menu label={intl.formatMessage({ id: 'mediator.add_date' })}>
                <Table.Menu.OptionGroup
                  value={orderBy}
                  onChange={setOrderBy}
                  type="radio"
                  title={intl.formatMessage({ id: 'sort-by' })}
                >
                  <Table.Menu.OptionItem value="DESC">
                    <Text>{intl.formatMessage({ id: 'global.filter_last' })}</Text>
                    <Icon ml="auto" name={CapUIIcon.ArrowDownO} />
                  </Table.Menu.OptionItem>

                  <Table.Menu.OptionItem value="ASC">
                    <Text>{intl.formatMessage({ id: 'global.filter_old' })}</Text>
                    <Icon ml="auto" name={CapUIIcon.ArrowUpO} />
                  </Table.Menu.OptionItem>
                </Table.Menu.OptionGroup>
              </Table.Menu>
            </Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody
          useInfiniteScroll={!!data?.participants?.totalCount}
          onScrollToBottom={() => {
            loadNext(50)
          }}
          hasMore={hasNext}
          scrollParentRef={contentRef || undefined}
        >
          {data?.participants?.edges.map(({ node: participant }) => {
            const isAccounted = participant.votes?.edges?.[0]?.node.isAccounted
            const hasEmail = !!participant.email
            const hasName = participant.firstname || participant.lastname;
            const fullname = `${participant.firstname || ''} ${participant.lastname || ''}`;
            return (
              <Table.Tr key={participant.id} rowId={participant.id} data-cy="participant-item">
                <Table.Td>
                  <Text
                    sx={{cursor: 'pointer'}}
                    onClick={() => {
                      setSelectedParticipant({ id: participant.id, token: participant.token })
                    }}
                  >
                    {hasName ? fullname : intl.formatMessage({id: 'anonymous.participant'})}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Tag variantColor={isAccounted ? 'green' : 'red'}>
                    {intl.formatMessage({
                      id: isAccounted
                        ? 'mediator.participation_status.complete'
                        : 'mediator.participation_status.missing_data',
                    })}
                  </Tag>
                </Table.Td>
                <Table.Td>
                  <Icon
                    name={hasEmail ? CapUIIcon.Check : CapUIIcon.Cross}
                    color={hasEmail ? 'green.500' : 'red.500'}
                  />
                </Table.Td>
                <Table.Td>{moment(participant.createdAt).format('DD/MM/YYYY')}</Table.Td>
                <Table.Td>
                  <ButtonQuickAction
                    variantColor="blue"
                    icon={CapUIIcon.Pencil}
                    label={intl.formatMessage({ id: 'comment.update.button' })}
                    onClick={() => {
                      setSelectedParticipant({ id: participant.id, token: participant.token })
                    }}
                  />
                  {
                    (!isAccounted && !hasEmail) && (
                      <DeleteParticipantModal participant={participant} mediator={data} connection={data.participants.__id}/>
                    )
                  }
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </React.Suspense>
  )
}

export default ParticipantList
