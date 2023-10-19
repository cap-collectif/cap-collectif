import React, { useState } from 'react'
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup, ListGroupItem, Button, Panel } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import type { RelayPaginationProp } from 'react-relay'
import { graphql, createPaginationContainer } from 'react-relay'
import type { ArgumentListViewPaginated_argumentable } from '~relay/ArgumentListViewPaginated_argumentable.graphql'
import ArgumentItem from './ArgumentItem'
import Loader from '../Ui/FeedbacksIndicators/Loader'
import type { ArgumentType } from '../../types'
import config from '~/config'
type Props = {
  readonly relay: RelayPaginationProp
  readonly argumentable: ArgumentListViewPaginated_argumentable
  readonly type: ArgumentType
}
const ARGUMENTS_PAGINATION = config.isMobile ? 3 : 25
export const ArgumentListViewPaginated = ({ argumentable, relay, type }: Props) => {
  const [loading, setLoading] = useState<boolean>(false)

  if (!argumentable.arguments.edges || argumentable.arguments.edges.length === 0) {
    return (
      <Panel.Body className="text-center excerpt">
        <i className="cap-32 cap-baloon-1" />
        <br />
        <FormattedMessage id={`no-argument-${type.toLowerCase()}`} />
      </Panel.Body>
    )
  }

  return (
    <ListGroup>
      {argumentable.arguments.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(argument => (
          // @ts-ignore
          <ArgumentItem key={argument.id} argument={argument} />
        ))}
      {relay.hasMore() && (
        <ListGroupItem>
          {loading ? (
            <Loader size={28} inline />
          ) : (
            <Button
              block
              bsStyle="link"
              onClick={() => {
                setLoading(true)
                relay.loadMore(ARGUMENTS_PAGINATION, () => {
                  setLoading(false)
                })
              }}
            >
              <FormattedMessage id={`see-more-arguments-${type.toLowerCase()}`} />
            </Button>
          )}
        </ListGroupItem>
      )}
    </ListGroup>
  )
}
export default createPaginationContainer(
  ArgumentListViewPaginated,
  {
    argumentable: graphql`
      fragment ArgumentListViewPaginated_argumentable on Argumentable
      @argumentDefinitions(
        isAuthenticated: { type: "Boolean!" }
        count: { type: "Int!" }
        cursor: { type: "String" }
        type: { type: "ArgumentValue!" }
        orderBy: { type: "ArgumentOrder!" }
      ) {
        id
        arguments(first: $count, after: $cursor, type: $type, orderBy: $orderBy)
          @connection(key: "ArgumentListViewPaginated_arguments", filters: ["type", "orderBy"]) {
          totalCount
          edges {
            node {
              id
              ...ArgumentItem_argument @arguments(isAuthenticated: $isAuthenticated)
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    `,
  },
  {
    direction: 'forward',

    getConnectionFromProps(props: Props) {
      return props.argumentable && props.argumentable.arguments
    },

    getFragmentVariables(prevVars) {
      return { ...prevVars }
    },

    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return { ...fragmentVariables, count, cursor, argumentableId: props.argumentable.id }
    },

    query: graphql`
      query ArgumentListViewPaginatedQuery(
        $argumentableId: ID!
        $isAuthenticated: Boolean!
        $type: ArgumentValue!
        $cursor: String
        $orderBy: ArgumentOrder!
        $count: Int!
      ) {
        argumentable: node(id: $argumentableId) {
          id
          ...ArgumentListViewPaginated_argumentable
            @arguments(
              isAuthenticated: $isAuthenticated
              type: $type
              cursor: $cursor
              orderBy: $orderBy
              count: $count
            )
        }
      }
    `,
  },
)
