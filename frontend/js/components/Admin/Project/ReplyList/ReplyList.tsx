import * as React from 'react'
import { useIntl } from 'react-intl'
import type { GraphQLTaggedNode } from 'react-relay'
import { graphql, usePaginationFragment } from 'react-relay'
import Table from '~ds/Table'
import type { ReplyList_questionnaire$key } from '~relay/ReplyList_questionnaire.graphql'
import ReplyItem from '~/components/Admin/Project/ReplyList/ReplyItem'
import Menu from '../../../DesignSystem/Menu/Menu'
import Button from '~ds/Button/Button'
import Icon, { ICON_NAME } from '~ds/Icon/Icon'
import Text from '~ui/Primitives/Text'
import ReplyModalConfirmationDelete from '~/components/Admin/Project/ReplyList/ReplyModalConfirmationDelete'
export const REPLY_LIST_PAGINATION = 20
type Props = {
  readonly questionnaire: ReplyList_questionnaire$key
  readonly term: string
  readonly resetTerm: () => void
}
export const ReplyListQuestionnaire: GraphQLTaggedNode = graphql`
  fragment ReplyList_questionnaire on Questionnaire
  @argumentDefinitions(
    countRepliesPagination: { type: "Int!" }
    cursorRepliesPagination: { type: "String" }
    repliesTerm: { type: "String" }
    repliesOrderBy: { type: "ReplyOrder" }
    repliesFilterStatus: { type: "[ReplyStatus]" }
  )
  @refetchable(queryName: "ReplyList_adminRepliesPagination") {
    adminReplies(
      first: $countRepliesPagination
      after: $cursorRepliesPagination
      term: $repliesTerm
      orderBy: $repliesOrderBy
      filterStatus: $repliesFilterStatus
    ) @connection(key: "ReplyList_adminReplies") {
      __id
      totalCount
      edges {
        node {
          id
          ...ReplyItem_reply
        }
      }
    }
  }
`

const ReplyList = ({ questionnaire, term, resetTerm }: Props): JSX.Element => {
  const intl = useIntl()
  const firstRendered = React.useRef(null)
  const [orderBy, setOrderBy] = React.useState({
    field: 'CREATED_AT',
    direction: 'DESC',
  })
  const [status, setStatus] = React.useState(['PUBLISHED', 'NOT_PUBLISHED', 'DRAFT', 'PENDING'])
  const { data, loadNext, hasNext, refetch } = usePaginationFragment(ReplyListQuestionnaire, questionnaire)
  const { adminReplies } = data
  const hasReplies = adminReplies ? adminReplies.totalCount > 0 : false
  React.useEffect(() => {
    if (firstRendered.current) {
      refetch({
        repliesTerm: term || null,
        repliesOrderBy: orderBy,
        repliesFilterStatus: status,
      })
    }

    firstRendered.current = true
  }, [refetch, term, orderBy, status])
  const connectionName = adminReplies?.__id
  return (
    <Table
      selectable
      onReset={() => {
        setOrderBy({
          field: 'CREATED_AT',
          direction: 'DESC',
        })
        resetTerm()
      }}
      actionBar={({ selectedRows }) => (
        <ReplyModalConfirmationDelete
          replyIds={selectedRows}
          connectionName={connectionName}
          disclosure={
            <Button variantSize="small" variant="secondary" variantColor="danger">
              {`${intl.formatMessage({
                id: 'global.remove',
              })} (${selectedRows.length})`}
            </Button>
          }
        />
      )}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            {intl.formatMessage(
              {
                id: 'count-answers',
              },
              {
                num: adminReplies.totalCount,
              },
            )}
          </Table.Th>
          <Table.Th>
            {intl.formatMessage({
              id: 'global.author',
            })}
          </Table.Th>
          <Table.Th>
            {({ styles }) => (
              <Menu>
                <Menu.Button as={React.Fragment}>
                  <Button rightIcon={ICON_NAME.ARROW_DOWN_O} {...styles}>
                    {intl.formatMessage({
                      id: 'global.status',
                    })}
                  </Button>
                </Menu.Button>
                <Menu.List>
                  <Menu.OptionGroup
                    value={status}
                    onChange={setStatus}
                    type="checkbox"
                    title={intl.formatMessage({
                      id: 'sort-by',
                    })}
                  >
                    <Menu.OptionItem value="PUBLISHED">
                      <Text>
                        {intl.formatMessage({
                          id: 'global.published',
                        })}
                      </Text>
                    </Menu.OptionItem>
                    <Menu.OptionItem value="NOT_PUBLISHED">
                      <Text>
                        {intl.formatMessage({
                          id: 'global.no.published',
                        })}
                      </Text>
                    </Menu.OptionItem>
                    <Menu.OptionItem value="DRAFT">
                      <Text>
                        {intl.formatMessage({
                          id: 'global-draft',
                        })}
                      </Text>
                    </Menu.OptionItem>
                    <Menu.OptionItem value="PENDING">
                      <Text>
                        {intl.formatMessage({
                          id: 'waiting',
                        })}
                      </Text>
                    </Menu.OptionItem>
                  </Menu.OptionGroup>
                </Menu.List>
              </Menu>
            )}
          </Table.Th>
          <Table.Th>
            {({ styles }) => (
              <Menu>
                <Menu.Button as={React.Fragment}>
                  <Button rightIcon={ICON_NAME.ARROW_DOWN_O} {...styles}>
                    {intl.formatMessage({
                      id: 'global.update',
                    })}
                  </Button>
                </Menu.Button>
                <Menu.List>
                  <Menu.OptionGroup
                    value={orderBy.field === 'UPDATED_AT' ? orderBy.direction : ''}
                    onChange={direction =>
                      setOrderBy({
                        field: 'UPDATED_AT',
                        direction,
                      })
                    }
                    type="radio"
                    title={intl.formatMessage({
                      id: 'sort-by',
                    })}
                  >
                    <Menu.OptionItem value="DESC">
                      <Text>
                        {intl.formatMessage({
                          id: 'global.filter_last',
                        })}
                      </Text>
                      <Icon ml="auto" name="ARROW_DOWN_O" />
                    </Menu.OptionItem>

                    <Menu.OptionItem value="ASC">
                      <Text>
                        {intl.formatMessage({
                          id: 'global.filter_old',
                        })}
                      </Text>
                      <Icon ml="auto" name="ARROW_UP_O" />
                    </Menu.OptionItem>
                  </Menu.OptionGroup>
                </Menu.List>
              </Menu>
            )}
          </Table.Th>
          <Table.Th>
            {({ styles }) => (
              <Menu>
                <Menu.Button as={React.Fragment}>
                  <Button rightIcon={ICON_NAME.ARROW_DOWN_O} {...styles}>
                    {intl.formatMessage({
                      id: 'creation',
                    })}
                  </Button>
                </Menu.Button>
                <Menu.List>
                  <Menu.OptionGroup
                    value={orderBy.field === 'CREATED_AT' ? orderBy.direction : ''}
                    onChange={direction =>
                      setOrderBy({
                        field: 'CREATED_AT',
                        direction,
                      })
                    }
                    type="radio"
                    title={intl.formatMessage({
                      id: 'sort-by',
                    })}
                  >
                    <Menu.OptionItem value="DESC">
                      <Text>
                        {intl.formatMessage({
                          id: 'global.filter_last',
                        })}
                      </Text>
                      <Icon ml="auto" name="ARROW_DOWN_O" />
                    </Menu.OptionItem>

                    <Menu.OptionItem value="ASC">
                      <Text>
                        {intl.formatMessage({
                          id: 'global.filter_old',
                        })}
                      </Text>
                      <Icon ml="auto" name="ARROW_UP_O" />
                    </Menu.OptionItem>
                  </Menu.OptionGroup>
                </Menu.List>
              </Menu>
            )}
          </Table.Th>
          <Table.Th noPlaceholder> </Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody
        useInfiniteScroll={hasReplies}
        onScrollToBottom={() => {
          loadNext(REPLY_LIST_PAGINATION)
        }}
        hasMore={hasNext}
      >
        {adminReplies?.edges
          ?.filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(reply => (
            <Table.Tr key={reply.id} rowId={reply.id} checkboxLabel={reply.id}>
              <ReplyItem reply={reply} connectionName={connectionName} />
            </Table.Tr>
          ))}
      </Table.Tbody>
    </Table>
  )
}

export default ReplyList
