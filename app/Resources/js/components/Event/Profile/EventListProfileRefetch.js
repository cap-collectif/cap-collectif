// @flow
import * as React from 'react';
import { graphql, createRefetchContainer } from 'react-relay';
import { Row, Col } from 'react-bootstrap';
import EventPreview from '../EventPreview';
import { EventListProfileQuery_user } from './__generated__/EventListProfileQuery.graphql';

type Props = {
  user: EventListProfileQuery_user,
};

export class EventListProfileRefetch extends React.Component<Props> {
  render() {
    const { user } = this.props;
    if (!user) {
      return null;
    }

    return (
      <Row>
        {user.events.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map((node, key) => (
            <Col key={key} md={6} xs={12}>
              <EventPreview event={node} isHighlighted={false} />
            </Col>
          ))}
      </Row>
    );
  }
}

export default createRefetchContainer(
  EventListProfileRefetch,
  {
    user: graphql`
      fragment EventListProfileRefetch_user on User {
        events(first: 100) {
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
    query EventListProfileRefetchQuery($userId: ID!) {
      user: node(id: $userId) {
        ...EventListProfileRefetch_user
      }
    }
  `,
);
