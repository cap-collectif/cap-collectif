// @flow
import React, { Component } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import styled from 'styled-components';
import environment, { graphqlError } from '../../createRelayEnvironment';
import type { SectionContainerQueryResponse } from '~relay/SectionContainerQuery.graphql';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import WYSIWYGRender from '../Form/WYSIWYGRender';
import MetricsBox from '../Ui/Metrics/MetricsBox';

export type Props = {|
  body: string,
  title: string,
  teaser: string,
  metricsToDisplayBasics: boolean,
  metricsToDisplayEvents: boolean,
  metricsToDisplayProjects: boolean,
|};

const MetricsRow = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`;

export class SectionContainer extends Component<Props> {
  render() {
    const {
      body,
      title,
      teaser,
      metricsToDisplayBasics,
      metricsToDisplayEvents,
      metricsToDisplayProjects,
    } = this.props;

    const metricsSection = document.getElementById('metrics');
    const sectionBgColor = window
      .getComputedStyle(metricsSection, null)
      .getPropertyValue('background-color');
    const colorToDisplay = sectionBgColor === 'rgb(246, 246, 246)' ? 'white' : '#F6F6F6';

    return (
      <div className="row">
        <h2 className="h2">{title}</h2>
        <p className="block">{teaser}</p>
        <p className="block">
          <WYSIWYGRender value={body} />
        </p>
        <QueryRenderer
          variables={{}}
          environment={environment}
          query={graphql`
            query SectionContainerQuery {
              votes: votes {
                totalCount
              }
              contributions: allContributions
              contributors: allContributors {
                totalCount
              }
              events {
                totalCount
              }
              projects(onlyPublic: true) {
                totalCount
              }
            }
          `}
          render={({
            error,
            props,
          }: {
            ...ReactRelayReadyState,
            props: ?SectionContainerQueryResponse,
          }) => {
            if (error) {
              console.log(error); // eslint-disable-line no-console
              return graphqlError;
            }
            if (props) {
              if (
                props.votes &&
                props.contributors &&
                props.events &&
                props.projects &&
                props.contributions !== null
              ) {
                return (
                  <MetricsRow className="row">
                    {metricsToDisplayBasics && (
                      <React.Fragment>
                        <MetricsBox
                          color={colorToDisplay}
                          totalCount={props.contributions}
                          icon="cap-file-1"
                          label="capco.section.metrics.contributions"
                        />

                        <MetricsBox
                          color={colorToDisplay}
                          icon="cap-user-2"
                          totalCount={props.contributors.totalCount}
                          label="capco.section.metrics.participants"
                        />
                      </React.Fragment>
                    )}

                    {metricsToDisplayBasics && props.votes && props.votes.totalCount > 0 && (
                      <MetricsBox
                        color={colorToDisplay}
                        icon="cap-hand-like-2"
                        totalCount={props.votes.totalCount}
                        label="capco.section.metrics.votes"
                      />
                    )}

                    {metricsToDisplayEvents && props.events && props.events.totalCount > 0 && (
                      <MetricsBox
                        color={colorToDisplay}
                        icon="cap-calendar-1"
                        totalCount={props.events.totalCount}
                        label="capco.section.metrics.events"
                      />
                    )}

                    {metricsToDisplayProjects && (
                      <MetricsBox
                        color={colorToDisplay}
                        totalCount={props.projects.totalCount}
                        label="capco.section.metrics.projects"
                        icon="cap-folder-2"
                      />
                    )}
                  </MetricsRow>
                );
              }
              return graphqlError;
            }
            return <Loader />;
          }}
        />
      </div>
    );
  }
}

export default SectionContainer;
