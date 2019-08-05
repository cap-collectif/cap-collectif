// @flow
import React from 'react';
import styled from 'styled-components';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import EventPreview from '../Event/EventPreview';
import type {
  HomePageEventsQueryResponse,
  HomePageEventsQueryVariables,
} from '~relay/HomePageEventsQuery.graphql';

type Props = {|
  limit: number,
|};

const EventContainer = styled.div`
  padding-top: 20px;
  width: 105%;

  >div{
    width: 45%;
    display: inline-block;
    margin-right: 5%;
  }

  @media (max-width: 1200px) {
    >div{
      width: 70%;
      display: block;
      margin-right: 0;
    }
    
  @media (max-width: 380px) {
    >div{
      width: 100%;
    }
  }
`;

class HomePageEvents extends React.Component<Props> {
  renderEventList = ({
    error,
    props,
  }: {|
    ...ReadyState,
    props: ?HomePageEventsQueryResponse,
  |}) => {
    if (error) {
      return graphqlError;
    }
    if (props) {
      return (
        <EventContainer>
          {props.events.edges &&
            props.events.edges
              .filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map(node => (
                <div>
                  {/* $FlowFixMe */}
                  <EventPreview isHighlighted={false} event={node} />
                </div>
              ))}
        </EventContainer>
      );
    }
    return <Loader />;
  };

  render() {
    const { limit } = this.props;

    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query HomePageEventsQuery($count: Int, $orderBy: EventsOrder) {
            events(orderBy: $orderBy, first: $count) {
              edges {
                node {
                  id
                  ...EventPreview_event
                }
              }
            }
          }
        `}
        variables={
          ({
            count: limit,
            orderBy: {
              field: 'START_AT',
              direction: 'DESC',
            },
          }: HomePageEventsQueryVariables)
        }
        render={this.renderEventList}
      />
    );
  }
}

export default HomePageEvents;
