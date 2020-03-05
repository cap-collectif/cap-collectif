// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import environment, { graphqlError } from '../../createRelayEnvironment';
import EventPreview from '../Event/EventPreview/EventPreview';
import type {
  PresentationStepEventsQueryResponse,
  PresentationStepEventsQueryVariables,
} from '~relay/PresentationStepEventsQuery.graphql';
import { EventContainer } from '~/components/HomePage/HomePageEvents';

export type Props = {|
  +showAllUrl: string,
  +limit: number,
  +projectId: string,
|};

class PresentationStepEvents extends React.Component<Props> {
  renderEventList = ({
    error,
    props,
  }: {
    ...ReactRelayReadyState,
    props: ?PresentationStepEventsQueryResponse,
  }) => {
    if (error) {
      return graphqlError;
    }
    if (props && props.events.edges && props.events.edges.length > 0) {
      const { showAllUrl } = this.props;
      return (
        <div id="PresentationStepEvents" className="block">
          <h2 className="h2">
            <FormattedMessage id="global.events" />{' '}
            <span className="small excerpt">{props.events.totalCount}</span>
          </h2>
          <EventContainer>
            {props.events.edges &&
              props.events.edges
                .filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map((node, key) => (
                  <div key={key}>
                    <EventPreview event={node} />
                  </div>
                ))}
          </EventContainer>
          {props.events.totalCount > 2 && (
            <a id="project-events" href={showAllUrl} className="btn btn-primary btn--outline">
              <FormattedMessage id="event.see_all" />
            </a>
          )}
        </div>
      );
    }
    return null;
  };

  render() {
    const { limit, projectId } = this.props;

    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query PresentationStepEventsQuery($count: Int, $orderBy: EventOrder!, $project: ID!) {
            events(orderBy: $orderBy, first: $count, project: $project, isFuture: null) {
              totalCount
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
            project: projectId,
            orderBy: {
              field: 'END_AT',
              direction: 'DESC',
            },
          }: PresentationStepEventsQueryVariables)
        }
        render={this.renderEventList}
      />
    );
  }
}

export default PresentationStepEvents;
