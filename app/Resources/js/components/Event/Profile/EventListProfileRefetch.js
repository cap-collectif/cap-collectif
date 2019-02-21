// @flow
import * as React from 'react';
import { graphql, createRefetchContainer } from 'react-relay';
import styled from 'styled-components';
import { Row, Col } from 'react-bootstrap';
import EventPreview from '../EventPreview';
import { EventListProfileQuery_user } from './__generated__/EventListProfileQuery.graphql';

type Props = {
  user: EventListProfileQuery_user,
};

const RowCustom = styled(Row)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 15px;
`;

export class EventListProfileRefetch extends React.Component<Props> {
  render() {
    const { user } = this.props;
    if (!user) {
      return null;
    }

    return (
      <React.Fragment>
        <RowCustom>
          <Col>
            <select>
              <option value="new">Les plus récents</option>
              <option value="old">Les plus anciens</option>
            </select>
          </Col>
        </RowCustom>
        <Row>
          {user.events.edges
            .filter(Boolean)
            .map(edge => edge.node)
            .filter(Boolean)
            .map((node, key) => (
              <Col key={key} md={6} xs={12}>
                <EventPreview event={node} isHighlighted={false} isAuthorDisplay={false} />
              </Col>
            ))}
        </Row>
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
