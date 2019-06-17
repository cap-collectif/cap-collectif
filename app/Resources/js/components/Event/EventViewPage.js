// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Row } from 'react-bootstrap';
import { graphql, QueryRenderer, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import type {
  EventViewPageQueryResponse,
  EventViewPageQueryVariables,
} from '~relay/EventViewPageQuery.graphql';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import ShareButtonDropdown from '../Utils/ShareButtonDropdown';
import DatesInterval from '../Utils/DatesInterval';

type Props = {
  eventId: string,
};

export class EventViewPage extends React.Component<Props> {
  render() {
    return (
      <div className="event-page">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query EventViewPageQuery($eventId: ID!) {
              event: node(id: $eventId) {
                id
                ... on Event {
                  timeRange {
                    startAt
                    endAt
                  }
                  url
                  addressJson
                  title
                  media {
                    id
                    url
                    name
                  }
                  body
                  slug
                  projects {
                    title
                    url
                    id
                  }
                  author {
                    id
                    username
                  }
                }
              }
            }
          `}
          variables={
            ({
              eventId: this.props.eventId,
            }: EventViewPageQueryVariables)
          }
          render={({ error, props }: { props?: ?EventViewPageQueryResponse } & ReadyState) => {
            if (error) {
              console.log(error); // eslint-disable-line no-console
              return graphqlError;
            }
            if (props) {
              if (!props.event) {
                return graphqlError;
              }
              const address = props.event.addressJson
                ? JSON.parse(props.event.addressJson)[0].formatted_address
                : null;
              const lat = props.event.addressJson
                ? JSON.parse(props.event.addressJson)[0].geometry.location.lat
                : null;
              const lng = props.event.addressJson
                ? JSON.parse(props.event.addressJson)[0].geometry.location.lng
                : null;
              return (
                <section className="section--custom">
                  <div className="container container--thinner">
                    <ul className="event__meta  block">
                      <li className="excerpt">
                        <i className="cap cap-calendar-1" />
                        <DatesInterval
                          startAt={props.event.startAt}
                          endAt={props.event.endAt}
                          fullDay
                        />
                      </li>
                      <li className="excerpt">
                        <div>
                          <i className="cap cap-marker-1  excerpt" />
                          {address}
                        </div>
                      </li>
                    </ul>
                    {props.event.media && (
                      <img
                        className="block img-responsive"
                        src={props.event.media.url}
                        alt={props.event.media.name}
                        title={props.event.media.name}
                      />
                    )}
                    <div className="block" dangerouslySetInnerHTML={{ __html: props.event.body }} />

                    {lat && lng && (
                      <div
                        id="event_map"
                        className="event__map block"
                        data-lat={lat}
                        data-lng={lng}
                      />
                    )}
                    {props.event.projects && props.event.projects.length > 0 && (
                      <div className="block event_url-project">
                        <p>
                          <FormattedMessage id="event.show.projects.title" />
                        </p>
                        <ul>
                          {props.event.projects &&
                            props.event.projects.filter(Boolean).map(project => (
                              // $FlowFixMe
                              <li key={project.id}>
                                <a href={project.url} title={project.title}>
                                  {project.title}
                                </a>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      {props.event && props.event.url && (
                        <a className="btn btn-primary external-url mr-5" href={props.event.url}>
                          <FormattedMessage id="event.url_button" />
                        </a>
                      )}
                      {props.event && props.event.title && props.event.slug && props.event.url && (
                        <ShareButtonDropdown
                          title={props.event.title}
                          id={`event-${props.event.slug}`}
                          url={props.event.url}
                        />
                      )}
                    </div>
                  </div>
                </section>
              );
            }
            return (
              <Row>
                <Loader />
              </Row>
            );
          }}
        />
      </div>
    );
  }
}

export default EventViewPage;
