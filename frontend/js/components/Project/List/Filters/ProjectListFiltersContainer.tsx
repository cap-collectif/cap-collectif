import { $PropertyType } from 'utility-types'
import * as React from 'react'
import type { IntlShape } from 'react-intl'
import { injectIntl } from 'react-intl'
import { Row, Col } from 'react-bootstrap'
import { connect } from 'react-redux'
import { fetchQuery_DEPRECATED, graphql } from 'react-relay'
import ProjectListFilters, { selector } from './ProjectListFilters'
import ProjectListFilterOrder from './ProjectListFilterOrder'
import FiltersContainer from '../../../Filters/FiltersContainer'
import ProjectListSearch from '../ProjectListSearch'
import environment from '../../../../createRelayEnvironment'
import type { ProjectListFiltersContainerQueryResponse } from '~relay/ProjectListFiltersContainerQuery.graphql'
import type { GlobalState } from '../../../../types'
import config from '../../../../config'
export type ProjectType = {
  readonly id: string
  readonly title: string
  readonly slug: string
}
export type ProjectAuthor = {
  readonly id: string
  readonly username: string | null | undefined
}
export type ProjectDistrict = {
  readonly id: string
  readonly name: string | null | undefined
}
export type ProjectTheme = {
  id: string
  slug: string
  title: string
}
type Props = {
  readonly intl: IntlShape
  readonly type: string | null | undefined
  readonly author: string | null | undefined
  readonly themes: ProjectTheme[]
  readonly theme: string | null | undefined
  readonly district: string | null | undefined
}
type State = {
  projectTypes: $PropertyType<ProjectListFiltersContainerQueryResponse, 'projectTypes'>
  projectAuthors: $PropertyType<ProjectListFiltersContainerQueryResponse, 'projectAuthors'>
  projectDistricts: $PropertyType<ProjectListFiltersContainerQueryResponse, 'projectDistricts'>
  projects: $PropertyType<ProjectListFiltersContainerQueryResponse, 'projects'>
}
const getAvailableProjectResources = graphql`
  query ProjectListFiltersContainerQuery($onlyUsedByProjects: Boolean!) {
    projectTypes(onlyUsedByProjects: $onlyUsedByProjects) {
      id
      title
      slug
    }
    projectAuthors {
      id
      username
    }
    projectDistricts {
      totalCount
      edges {
        node {
          id
          name
        }
      }
    }
    projects {
      totalCount
    }
  }
`
export class ProjectListFiltersContainer extends React.Component<Props, State> {
  state = {
    projects: {
      totalCount: 0,
    },
    projectTypes: [],
    projectAuthors: [],
    projectDistricts: {
      totalCount: 0,
      edges: [],
    },
  }

  componentDidMount() {
    fetchQuery_DEPRECATED(environment, getAvailableProjectResources, {
      onlyUsedByProjects: true,
    }).then(
      ({ projectTypes, projectAuthors, projectDistricts, projects }: ProjectListFiltersContainerQueryResponse) => {
        this.setState({
          projectTypes: projectTypes || [],
          projectAuthors: projectAuthors || [],
          projectDistricts: projectDistricts || {
            totalCount: 0,
          },
          projects: projects || {
            totalCount: 0,
          },
        })
      },
    )
  }

  countFilter(): number {
    const { type, author, theme, district } = this.props
    return Number(!!author) + Number(!!type) + Number(!!theme) + Number(!!district)
  }

  renderFilters() {
    const { projectTypes, projectAuthors, projectDistricts, projects } = this.state
    const { intl, themes } = this.props

    if (
      projects.totalCount > 1 &&
      (projectTypes.length > 0 || projectAuthors.length > 0 || themes.length > 0 || projectDistricts.totalCount > 0)
    ) {
      return (
        <Col md={7} className={config.isMobile ? 'mt-10 mb-5' : ''}>
          <FiltersContainer
            type="project"
            overlay={
              <ProjectListFilters
                intl={intl}
                projectAuthors={projectAuthors}
                projectTypes={projectTypes}
                projectDistricts={projectDistricts}
                themes={themes}
              />
            }
            filterCount={this.countFilter()}
          />
        </Col>
      )
    }

    return null
  }

  render() {
    return (
      <Row>
        <Col md={2}>
          {/* @ts-expect-error */}
          <ProjectListFilterOrder />
        </Col>
        {this.renderFilters()}
        <Col md={3} smHidden xsHidden>
          <ProjectListSearch />
        </Col>
      </Row>
    )
  }
}

const mapStateToProps = (state: GlobalState) => ({
  themes: state.default.themes,
  author: selector(state, 'author'),
  theme: selector(state, 'theme'),
  type: selector(state, 'type'),
  district: selector(state, 'district'),
})

export default connect<any, any>(mapStateToProps)(injectIntl(ProjectListFiltersContainer))
