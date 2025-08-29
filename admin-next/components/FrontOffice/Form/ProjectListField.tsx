import * as React from 'react'
import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import { fetchQuery, GraphQLTaggedNode } from 'relay-runtime'
import { AsyncSelect, AsyncSelectProps } from '@cap-collectif/ui'
import { ProjectListFieldFrontOfficeQuery } from '@relay/ProjectListFieldFrontOfficeQuery.graphql'
import { useIntl } from 'react-intl'

type ProjectListFieldValue = {
  label: string
  value: string
}

export const getProjectList = graphql`
  query ProjectListFieldFrontOfficeQuery($term: String) {
    projects(term: $term) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
` as GraphQLTaggedNode

export const ProjectListField: React.FC<
  Omit<AsyncSelectProps<ProjectListFieldValue>, 'value'> & { name?: string; value?: string }
> = ({ value, ...props }) => {
  const [projects, setProjects] = React.useState<Array<ProjectListFieldValue>>([])
  const intl = useIntl()
  const loadOptions = async (term: string): Promise<ProjectListFieldValue[]> => {
    const projectsData = await fetchQuery<ProjectListFieldFrontOfficeQuery>(environment, getProjectList, {
      term,
    }).toPromise()

    const projects = projectsData?.projects?.edges

    if (projects) {
      const data = projects.map(t => ({
        label: t.node.title,
        value: t.node.id,
      }))
      setProjects(data)
      return data
    }

    return []
  }

  return (
    <AsyncSelect
      {...props}
      defaultOptions
      value={projects.find(p => p?.value === value)}
      loadOptions={loadOptions}
      noOptionsMessage={() => intl.formatMessage({ id: 'project.none' })}
      loadingMessage={() => intl.formatMessage({ id: 'global.loading' })}
    />
  )
}

export default ProjectListField
