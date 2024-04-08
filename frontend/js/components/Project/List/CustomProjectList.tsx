import * as React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import { connect } from 'react-redux'
import environment, { graphqlError } from '~/createRelayEnvironment'
import Loader from '~ui/FeedbacksIndicators/Loader'
import CustomProjectListView from './CustomProjectListView'
import ProjectsListPlaceholder from '~/components/Project/List/ProjectsListPlaceholder'
import type { FeatureToggles, GlobalState } from '~/types'
import type { CustomProjectListQuery$data } from '~relay/CustomProjectListQuery.graphql'
type Props = {
  readonly projectsCount: number
  readonly features: FeatureToggles
}
const query = graphql`
  query CustomProjectListQuery {
    homePageProjectsSectionConfiguration {
      projects {
        edges {
          node {
            ...ProjectPreview_project
          }
        }
      }
    }
  }
`

const CustomProjectList = ({ projectsCount, features }: Props) => {
  return (
    <QueryRenderer
      environment={environment as any}
      query={query}
      variables={{
        author: null,
      }}
      render={({
        error,
        props,
      }: ReactRelayReadyState & {
        props: CustomProjectListQuery$data | null | undefined
      }) => {
        if (error) {
          return graphqlError
        }

        if (!props) return null

        if (props && props.homePageProjectsSectionConfiguration) {
          return (
            <CustomProjectListView
              homePageProjectsSectionConfiguration={props.homePageProjectsSectionConfiguration}
              features={features}
            />
          )
        }

        return features.new_project_card ? <ProjectsListPlaceholder count={projectsCount} /> : <Loader />
      }}
    />
  )
}

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
})

export default connect(mapStateToProps)(CustomProjectList)
