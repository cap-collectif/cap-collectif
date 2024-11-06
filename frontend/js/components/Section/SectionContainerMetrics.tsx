import React from 'react'

import styled from 'styled-components'
import type { SectionContainerQueryResponse } from '~relay/SectionContainerQuery.graphql'
import MetricsBox from '../Ui/Metrics/MetricsBox'
import config from '~/config'

export type Props = SectionContainerQueryResponse & {
  metricsToDisplayBasics: boolean
  metricsToDisplayEvents: boolean
  metricsToDisplayProjects: boolean
}
const MetricsRow = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 10px;
`
export const SectionContainerMetrics = ({
  contributions,
  contributors,
  votes,
  events,
  projects,
  metricsToDisplayBasics,
  metricsToDisplayEvents,
  metricsToDisplayProjects,
}: Props) => {
  const metricsSection = document.getElementById('metrics')
  const sectionBgColor =
    config.canUseDOM && metricsSection
      ? window.getComputedStyle(metricsSection, null).getPropertyValue('background-color')
      : null
  const colorToDisplay = sectionBgColor === 'rgb(246, 246, 246)' ? 'white' : '#F6F6F6'
  return (
    <MetricsRow>
      {metricsToDisplayBasics && (
        <React.Fragment>
          <MetricsBox color={colorToDisplay} totalCount={contributions} icon="cap-file-1" label="global.contribution" />

          <MetricsBox
            color={colorToDisplay}
            totalCount={contributors.totalCount}
            icon="cap-user-2"
            label="project.show.meta.info.contributors"
          />
        </React.Fragment>
      )}
      {metricsToDisplayBasics && votes.totalCount > 0 && (
        <MetricsBox color={colorToDisplay} totalCount={votes.totalCount} icon="cap-hand-like-2" label="global.vote" />
      )}
      {metricsToDisplayEvents && events.totalCount > 0 && (
        <MetricsBox color={colorToDisplay} totalCount={events.totalCount} icon="cap-calendar-1" label="global.events" />
      )}
      {metricsToDisplayProjects && (
        <MetricsBox
          color={colorToDisplay}
          totalCount={projects.totalCount}
          icon="cap-folder-2"
          label="global.project.label"
        />
      )}
    </MetricsRow>
  )
}
export default SectionContainerMetrics
