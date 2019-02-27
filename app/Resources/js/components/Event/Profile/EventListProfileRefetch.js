// @flow
import * as React from 'react';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Row, Col } from 'react-bootstrap';
import EventPreview from '../EventPreview';
import { EventListProfileQuery_user } from './__generated__/EventListProfileQuery.graphql';

type Props = {
  user: EventListProfileQuery_user,
  relay: RelayRefetchProp,
};

type OrderByType = 'new' | 'old';

const RowCustom = styled(Row)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 15px;
  margin-right: 0;
`;

const RowList = styled(Row)`
  display: flex;
  flex-wrap: wrap;
`;

const getOrderBy = (order: OrderByType) => {
  if (order === 'old') {
    return { field: 'START_AT', direction: 'ASC' };
  }

  return { field: 'START_AT', direction: 'DESC' };
};

export class EventListProfileRefetch extends React.Component<Props> {
  _refetch = (order: OrderByType) => {
    const { relay } = this.props;
    const orderBy = getOrderBy(order);
    relay.refetch({ orderBy }, null);
  };

  onChangeHandler = (e: Event) => {
    // $FlowFixMe
    this._refetch(e.target.value);
  };

  render() {
    const { user } = this.props;
    if (!user) {
      return null;
    }

    return (
      <React.Fragment>
        <RowCustom>
          <Col>
            {/* eslint-disable-next-line jsx-a11y/no-onchange */}
            <select onChange={this.onChangeHandler}>
              <FormattedMessage id="project.sort.last">
                {(message: string) => <option value="new">{message}</option>}
              </FormattedMessage>
              <FormattedMessage id="opinion.sort.old">
                {(message: string) => <option value="old">{message}</option>}
              </FormattedMessage>
            </select>
          </Col>
        </RowCustom>
        <RowList>
          {user.events.edges
            .filter(Boolean)
            .map(edge => edge.node)
            .filter(Boolean)
            .map((node, key) => (
              <Col key={key} md={6} xs={12} className="d-flex">
                <EventPreview event={node} isHighlighted={false} isAuthorDisplay={false} />
              </Col>
            ))}
        </RowList>
      </React.Fragment>
    );
  }
}

export default createRefetchContainer(
  EventListProfileRefetch,
  {
    user: graphql`
      fragment EventListProfileRefetch_user on User
        @argumentDefinitions(orderBy: { type: "EventsOrder" }) {
        events(first: 100, orderBy: $orderBy) {
          totalCount
          edges {
            node {
              id
              ...EventPreview_event
            }
          }
        }
      }
    `,
  },
  graphql`
    query EventListProfileRefetchQuery($userId: ID!, $orderBy: EventsOrder) {
      user: node(id: $userId) {
        ...EventListProfileRefetch_user @arguments(orderBy: $orderBy)
      }
    }
  `,
);
