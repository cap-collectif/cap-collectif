import React, { Component } from 'react'
import { graphql, QueryRenderer } from 'react-relay'
import environment, { graphqlError } from '../../createRelayEnvironment'
import type { SectionContainerQueryResponse } from '~relay/SectionContainerQuery.graphql'
import Loader from '../Ui/FeedbacksIndicators/Loader'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import SectionContainerMetrics from './SectionContainerMetrics'

export type Props = {
  body: string
  title: string
  teaser: string
  metricsToDisplayBasics: boolean
  metricsToDisplayEvents: boolean
  metricsToDisplayProjects: boolean
}

const renderMetrics = (
  { contributions, contributors, votes, events, projects }: SectionContainerQueryResponse,
  { metricsToDisplayBasics, metricsToDisplayEvents, metricsToDisplayProjects }: Props,
) => (
  <SectionContainerMetrics
    metricsToDisplayBasics={metricsToDisplayBasics}
    metricsToDisplayEvents={metricsToDisplayEvents}
    metricsToDisplayProjects={metricsToDisplayProjects}
    contributions={contributions}
    contributors={contributors}
    votes={votes}
    events={events}
    projects={projects}
  />
)

export class SectionContainer extends Component<Props> {
  render() {
    const { body, title, teaser } = this.props
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
          }: ReactRelayReadyState & {
            props: SectionContainerQueryResponse | null | undefined
          }) => {
            if (error) {
              console.log(error) // eslint-disable-line no-console

              return graphqlError
            }

            if (props) {
              if (props.votes && props.contributors && props.events && props.projects && props.contributions !== null) {
                return renderMetrics(props, this.props)
              }

              return graphqlError
            }

            return <Loader />
          }}
        />
      </div>
    )
  }
}
export default SectionContainer
