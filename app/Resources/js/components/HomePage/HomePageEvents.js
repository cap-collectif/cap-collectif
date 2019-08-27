// @flow
import React from 'react';
import styled from 'styled-components';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import environment, { graphqlError } from '../../createRelayEnvironment';
import EventPreview from '../Event/EventPreview';

import type {
  HomePageEventsQueryResponse,
  HomePageEventsQueryVariables,
} from '~relay/HomePageEventsQuery.graphql';

export type Props = {|
  +showAllUrl: string,
  +section: {
    +title: ?string,
    +teaser: ?string,
    +body: ?string,
    +nbObjects: ?number,
  },
|};

const EventContainer = styled.div`
  padding-top: 20px;
  width: 100%;
  display: grid;
  grid-template-columns: 50% 50%;
  grid-auto-rows: auto;
  grid-auto-columns: 1fr;
  margin-bottom: 30px;

  >div{
    width: 97%;
    margin-bottom: 5%;
  }
  >div:nth-of-type(2n){
    margin-left: 2%;
  }


  >div>div{
    margin-bottom: 0;
  }



  @media (max-width: 1200px) {
    display: flex;
    flex-direction: column;

    >div{
      width: 70%;
      display: block;
      margin: 0 0 20px 0;
    }
    
  @media (max-width: 380px) {
    >div{
      width: 100%;
    }
  }
`;

const DEFAULT_EVENTS = 4;

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
    if (props && props.events.edges && props.events.edges.length > 0) {
      const { section, showAllUrl } = this.props;
      return (
        <div className="container">
          <h2 className="h2">
            {section.title ? section.title : <FormattedMessage id="homepage.section.events" />}
          </h2>
          {section.teaser ? <p className="block">{section.teaser}</p> : null}
          {section.body ? <p>{section.body}</p> : null}
          <EventContainer>
            {props.events.edges &&
              props.events.edges
                .filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map((node, key) => (
                  <div key={key}>
                    {/* $FlowFixMe */}
                    <EventPreview isHighlighted={false} event={node} />
                  </div>
                ))}
          </EventContainer>
          <a href={showAllUrl} className="btn btn-primary btn--outline">
            <FormattedMessage id="event.see_all" />
          </a>
        </div>
      );
    }
  };

  render() {
    const { section } = this.props;

    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query HomePageEventsQuery($count: Int, $orderBy: EventOrder!, $isFuture: Boolean!) {
            events(orderBy: $orderBy, first: $count, isFuture: $isFuture) {
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
            count: section.nbObjects ? section.nbObjects : DEFAULT_EVENTS,
            isFuture: true,
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
