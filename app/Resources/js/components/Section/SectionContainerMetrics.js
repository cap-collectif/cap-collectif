// @flow
import React, { Component } from 'react';

import styled from 'styled-components';

import type { SectionContainerQueryResponse } from '~relay/SectionContainerQuery.graphql';

import MetricsBox from '../Ui/Metrics/MetricsBox';

export type Props = {|
  metricsToDisplayBasics: boolean,
  metricsToDisplayEvents: boolean,
  metricsToDisplayProjects: boolean,
  ...SectionContainerQueryResponse,
|};

const MetricsRow = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`;

export class SectionContainerMetrics extends Component<Props> {
  render() {
    const { metricsToDisplayBasics, metricsToDisplayEvents, metricsToDisplayProjects } = this.props;

    const metricsSection = document.getElementById('metrics');
    const sectionBgColor = window
      .getComputedStyle(metricsSection, null)
      .getPropertyValue('background-color');
    const colorToDisplay = sectionBgColor === 'rgb(246, 246, 246)' ? 'white' : '#F6F6F6';

    return (
      <MetricsRow className="row">
        {metricsToDisplayBasics && (
          <React.Fragment>
            <MetricsBox
              color={colorToDisplay}
              totalCount={this.props.contributions}
              icon="cap-file-1"
              label="capco.section.metrics.contributions"
            />

            <MetricsBox
              color={colorToDisplay}
              totalCount={this.props.contributors.totalCount}
              icon="cap-user-2"
              label="capco.section.metrics.participants"
            />
          </React.Fragment>
        )}
        {metricsToDisplayBasics && this.props.votes.totalCount > 0 && (
          <MetricsBox
            color={colorToDisplay}
            totalCount={this.props.votes.totalCount}
            icon="cap-hand-like-2"
            label="capco.section.metrics.votes"
          />
        )}
        {metricsToDisplayEvents && this.props.events.totalCount > 0 && (
          <MetricsBox
            color={colorToDisplay}
            totalCount={this.props.events.totalCount}
            icon="cap-calendar-1"
            label="capco.section.metrics.events"
          />
        )}
        {metricsToDisplayProjects && (
          <MetricsBox
            color={colorToDisplay}
            totalCount={this.props.projects.totalCount}
            icon="cap-folder-2"
            label="capco.section.metrics.projects"
          />
        )}
      </MetricsRow>
    );
  }
}

export default SectionContainerMetrics;
