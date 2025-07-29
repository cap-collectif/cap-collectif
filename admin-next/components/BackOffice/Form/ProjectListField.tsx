import * as React from 'react'
import { graphql } from 'react-relay'
import type { ProjectListFieldQuery } from '@relay/ProjectListFieldQuery.graphql'
import { environment } from 'utils/relay-environement'
import { FieldInput, FieldSelect, BaseField } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'
import { fetchQuery, GraphQLTaggedNode } from 'relay-runtime'
import { ProjectAffiliation } from '@relay/DashboardContainerQuery.graphql'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'

interface ProjectListFieldProps
  extends Omit<BaseField, 'onChange' | 'control'>,
    Omit<FieldSelect, 'onChange' | 'type'> {
  id?: string
  menuPortalTarget?: boolean
  disabled?: boolean
}

type ProjectListFieldValue = {
  label: string
  value: string
}

export const getProjectList = graphql`
  query ProjectListFieldQuery($affiliations: [ProjectAffiliation!], $term: String) {
    viewer {
      projects(affiliations: $affiliations, query: $term) {
        edges {
          node {
            id
            title
          }
        }
      }
      organizations {
        id
        projects(affiliations: $affiliations) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    }
  }
` as GraphQLTaggedNode

export const ProjectListField: React.FC<ProjectListFieldProps> = ({ name, disabled, ...props }) => {
  const { control } = useFormContext()
  const { viewerSession } = useAppContext()

  const affiliations: ProjectAffiliation[] = viewerSession.isAdmin ? null : ['OWNER']

  const loadOptions = async (term: string): Promise<ProjectListFieldValue[]> => {
    const projectsData = await fetchQuery<ProjectListFieldQuery>(environment, getProjectList, {
      term,
      affiliations: affiliations,
    }).toPromise()

    const organization = projectsData.viewer.organizations?.[0]
    const owner = organization ?? projectsData.viewer
    const projects = owner?.projects?.edges

    if (projects) {
      return projects.map(t => ({
        label: t.node.title,
        value: t.node.id,
      }))
    }

    return []
  }

  return (
    <FieldInput
      {...props}
      control={control}
      type="select"
      name={name}
      defaultOptions
      loadOptions={loadOptions}
      // @ts-ignore
      disabled={disabled}
    />
  )
}

export default ProjectListField
