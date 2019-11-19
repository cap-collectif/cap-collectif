// @flow
import React from 'react';
import styled from 'styled-components';
import type { SectionContainerQueryResponse } from '~relay/SectionContainerQuery.graphql';
import MetricsBox from '../Ui/Metrics/MetricsBox';
import config from '~/config';

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

const { metricsToDisplayBasics, metricsToDisplayEvents, metricsToDisplayProjects } = MetricsRow;

export const SectionContainerMetrics = ({
  contributions,
  contributors,
  votes,
  events,
  projects,
}: Props) => {
  const metricsSection = document.getElementById('metrics');
  const sectionBgColor =
    config.canUseDOM && metricsSection
      ? window.getComputedStyle(metricsSection, null).getPropertyValue('background-color')
      : null;
  const colorToDisplay = sectionBgColor === 'rgb(246, 246, 246)' ? 'white' : '#F6F6F6';

  return (
    <MetricsRow className="row">
      {metricsToDisplayBasics && (
        <React.Fragment>
          <MetricsBox
            color={colorToDisplay}
            totalCount={contributions}
            icon="cap-file-1"
            label="capco.section.metrics.contributions"
          />

          <MetricsBox
            color={colorToDisplay}
            totalCount={contributors.totalCount}
            icon="cap-user-2"
            label="capco.section.metrics.participants"
          />
        </React.Fragment>
      )}
      {metricsToDisplayBasics && votes.totalCount > 0 && (
        <MetricsBox
          color={colorToDisplay}
          totalCount={votes.totalCount}
          icon="cap-hand-like-2"
          label="capco.section.metrics.votes"
        />
      )}
      {metricsToDisplayEvents && events.totalCount > 0 && (
        <MetricsBox
          color={colorToDisplay}
          totalCount={events.totalCount}
          icon="cap-calendar-1"
          label="capco.section.metrics.events"
        />
      )}
      {metricsToDisplayProjects && (
        <MetricsBox
          color={colorToDisplay}
          totalCount={projects.totalCount}
          icon="cap-folder-2"
          label="capco.section.metrics.projects"
        />
      )}
    </MetricsRow>
  );
};

export default SectionContainerMetrics;
