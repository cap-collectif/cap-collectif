import { $Values } from 'utility-types'
import * as React from 'react'
import type { RelayRefetchProp } from 'react-relay'
import { graphql, createRefetchContainer } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import EventPreview from '../EventPreview/EventPreview'
import type { EventListProfileRefetch_user } from '~relay/EventListProfileRefetch_user.graphql'
import EventListProfileRefetchContainer from './EventListProfileRefetch.style'
import Input from '~/components/Form/Input'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import type { EventListProfileRefetchQueryVariables } from '~relay/EventListProfileRefetchQuery.graphql'
type Props = {
  user: EventListProfileRefetch_user
  relay: RelayRefetchProp
}
export const ORDER_TYPE: {
  LAST: 'LAST'
  OLD: 'OLD'
} = {
  LAST: 'LAST',
  OLD: 'OLD',
}
const orderTypes = [
  {
    label: 'project.sort.last',
    value: ORDER_TYPE.LAST,
  },
  {
    label: 'opinion.sort.old',
    value: ORDER_TYPE.OLD,
  },
]
export const getOrderBy = (order: $Values<typeof ORDER_TYPE>) =>
  order === ORDER_TYPE.OLD
    ? {
        field: 'START_AT',
        direction: 'ASC',
      }
    : {
        field: 'START_AT',
        direction: 'DESC',
      }
export const EventListProfileRefetch = ({ relay, user }: Props) => {
  const _refetch = (order: $Values<typeof ORDER_TYPE>) => {
    const orderBy = getOrderBy(order)
    relay.refetch(
      {
        userId: user.id,
        orderBy,
        isAuthenticated: true,
      } as EventListProfileRefetchQueryVariables,
      null,
    )
  }

  const onChangeHandler = (e: Event) => {
    // @ts-expect-error
    _refetch(e.target.value)
  }

  return user ? (
    <EventListProfileRefetchContainer>
      <header>
        <h2 className="h2">
          <FormattedMessage id="global.events" />
        </h2>
        <div className="wrapper-select">
          <Input type="select" id="orderBy" name="orderBy" className="form-control" onChange={onChangeHandler}>
            {orderTypes.map((type, i) => (
              <FormattedMessage id={type.label} key={i}>
                {(message: string) => <option value={type.value}>{message}</option>}
              </FormattedMessage>
            ))}
          </Input>
          <Icon name={ICON_NAME.arrowDown} size={8} />
        </div>
      </header>
      <div className="event_container">
        {user.events.edges &&
          user.events.edges
            .filter(Boolean)
            .map(edge => edge.node)
            .filter(Boolean)
            .map((node, key) => <EventPreview event={node} isAuthorHidden key={key} />)}
      </div>
    </EventListProfileRefetchContainer>
  ) : null
}
export default createRefetchContainer(
  EventListProfileRefetch,
  {
    user: graphql`
      fragment EventListProfileRefetch_user on User
      @argumentDefinitions(orderBy: { type: "EventOrder" }, isAuthenticated: { type: "Boolean!" }) {
        id
        events(first: 100, orderBy: $orderBy, onlyWhenAuthor: true) {
          edges {
            node {
              id
              ...EventPreview_event @arguments(isAuthenticated: $isAuthenticated)
            }
          }
        }
      }
    `,
  },
  graphql`
    query EventListProfileRefetchQuery($userId: ID!, $orderBy: EventOrder, $isAuthenticated: Boolean!) {
      user: node(id: $userId) {
        ...EventListProfileRefetch_user @arguments(orderBy: $orderBy, isAuthenticated: $isAuthenticated)
      }
    }
  `,
)
