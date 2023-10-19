import { $PropertyType } from 'utility-types'
import React from 'react'
import { Col } from 'react-bootstrap'
import { connect } from 'react-redux'
import { reduxForm, formValueSelector } from 'redux-form'
import type { IntlShape } from 'react-intl'
import 'react-intl'
import type { GlobalState, FeatureToggles } from '~/types'
import ProjectsListFilterTypes from './ProjectListFilterTypes'
import ProjectsListFilterAuthors from './ProjectListFilterAuthors'
import ProjectsListFilterThemes from './ProjectListFilterThemes'
import ProjectsListFilterStatus from './ProjectListFilterStatus'
import ProjectsListFilterDistricts from './ProjectListFilterDistricts'
import type { ProjectType, ProjectAuthor, ProjectTheme } from './ProjectListFiltersContainer'
import type { ProjectListFiltersContainerQueryResponse } from '~relay/ProjectListFiltersContainerQuery.graphql'
import ProjectsListFilterArchived from '~/components/Project/List/Filters/ProjectsListFilterArchived'
import type { ProjectArchiveFilter } from '~relay/ProjectListViewRefetchQuery.graphql'
const formName = 'ProjectListFilters'
type Props = {
  author: string | null | undefined
  features: FeatureToggles
  intl: IntlShape
  projectTypes: ProjectType[]
  projectAuthors: ProjectAuthor[]
  projectDistricts: $PropertyType<ProjectListFiltersContainerQueryResponse, 'projectDistricts'>
  district: string | null | undefined
  theme: string | null | undefined
  status: string | null | undefined
  themes: ProjectTheme[]
  readonly archived?: ProjectArchiveFilter | null
}

class ProjectListFilters extends React.Component<Props> {
  renderTypeFilter() {
    const { projectTypes } = this.props
    return <ProjectsListFilterTypes projectTypes={projectTypes} formName={formName} />
  }

  renderAuthorsFilter() {
    const { intl, projectAuthors, author } = this.props
    return <ProjectsListFilterAuthors authors={projectAuthors} intl={intl} author={author} />
  }

  renderThemeFilter() {
    const { features, themes, theme, intl } = this.props

    if (features.themes) {
      return <ProjectsListFilterThemes themes={themes} intl={intl} theme={theme} />
    }
  }

  renderStatusFilter() {
    const { status, intl } = this.props
    return <ProjectsListFilterStatus intl={intl} status={status} />
  }

  renderDistrictsFilter() {
    const { district, projectDistricts, intl } = this.props
    return <ProjectsListFilterDistricts district={district} projectDistricts={projectDistricts} intl={intl} />
  }

  renderStateFilter() {
    const { archived, intl } = this.props
    return <ProjectsListFilterArchived archived={archived} intl={intl} />
  }

  render() {
    const filters = []
    filters.push(this.renderTypeFilter())
    filters.push(this.renderThemeFilter())
    filters.push(this.renderAuthorsFilter())
    filters.push(this.renderStatusFilter())
    filters.push(this.renderDistrictsFilter())
    filters.push(this.renderStateFilter())

    if (filters.filter(Boolean).length > 0) {
      return (
        <form>
          {filters.map((filter, index) => (
            <Col key={index} className="mt-5">
              <div>{filter}</div>
            </Col>
          ))}
        </form>
      )
    }

    return null
  }
}

export const selector = formValueSelector(formName)
type FormValues = {
  readonly author: string | null | undefined
  readonly theme: string | null | undefined
  readonly type: string | null | undefined
  readonly status: string | null | undefined
  readonly district: string | null | undefined
  readonly archived: string | null | undefined
}
export const getInitialValues = (props: { readonly archived?: ProjectArchiveFilter | null }): FormValues => {
  const urlSearch = new URLSearchParams(window.location.search)

  const getArchived = () => {
    if (window.location.pathname === '/projects/archived') {
      return 'ARCHIVED'
    }

    if (urlSearch.get('archived')) {
      return urlSearch.get('archived')
    }

    if (props.archived !== undefined) {
      return props.archived
    }

    return 'ACTIVE'
  }

  return {
    status: urlSearch.get('status') || null,
    type: urlSearch.get('type') || null,
    author: urlSearch.get('author') || null,
    theme: urlSearch.get('theme') || null,
    district: urlSearch.get('district') || null,
    archived: getArchived(),
  }
}

const mapStateToProps = (state: GlobalState, props) => {
  return {
    features: state.default.features,
    author: selector(state, 'author'),
    theme: selector(state, 'theme'),
    type: selector(state, 'type'),
    status: selector(state, 'status'),
    district: selector(state, 'district'),
    archived: selector(state, 'archived'),
    initialValues: getInitialValues(props),
  }
}

const form = reduxForm({
  form: formName,
  destroyOnUnmount: false,
})(ProjectListFilters)
export default connect<any, any>(mapStateToProps)(form)
