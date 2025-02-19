import * as React from 'react'
import { graphql } from 'react-relay'
import type { StepListFieldQuery, StepListFieldQuery$data } from '@relay/StepListFieldQuery.graphql'
import { environment } from 'utils/relay-environement'
import { FieldInput, FieldSelect, BaseField } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'
import { fetchQuery, GraphQLTaggedNode } from 'relay-runtime'
import { ProjectAffiliation } from '@relay/DashboardContainerQuery.graphql'
import { useAppContext } from '@components/AppProvider/App.context'
import { useIntl } from 'react-intl'

interface StepListFieldProps extends Omit<BaseField, 'onChange' | 'control'>, Omit<FieldSelect, 'onChange' | 'type'> {
  id?: string
  menuPortalTarget?: boolean
  disabled?: boolean
  projectIds: Array<string>
}

type StepListFieldValue = {
  label: string
  value: string
  projectId: string
}

export const getStepList = graphql`
  query StepListFieldQuery($affiliations: [ProjectAffiliation!]) {
    viewer {
      projects(affiliations: $affiliations) {
        edges {
          node {
            id
            steps {
              value: id
              label: title
            }
          }
        }
      }
      organizations {
        projects(affiliations: $affiliations) {
          edges {
            node {
              id
              steps {
                value: id
                label: title
              }
            }
          }
        }
      }
    }
  }
` as GraphQLTaggedNode

const getSteps = (projects: StepListFieldQuery$data['viewer']['projects']['edges'], term: string) => {
  const steps = []
  ;(() => {
    projects
      ?.map(({ node }) => node.steps.map(step => ({ ...step, projectId: node.id })))
      .forEach(projectSteps => {
        if (projectSteps)
          return projectSteps.forEach(step => {
            if (step.label.includes(term ? term : '')) steps.push(step)
          })
      })
  })()

  return steps
}

export const StepListField: React.FC<StepListFieldProps> = ({ name, disabled, projectIds, ...props }) => {
  const intl = useIntl()
  const { control } = useFormContext()
  const { viewerSession } = useAppContext()

  const affiliations: ProjectAffiliation[] = viewerSession.isAdmin ? null : ['OWNER']

  const loadOptions = async (term: string): Promise<StepListFieldValue[]> => {
    const projectsData = await fetchQuery<StepListFieldQuery>(environment, getStepList, {
      affiliations: affiliations,
    }).toPromise()

    const organization = projectsData.viewer.organizations?.[0]
    const owner = organization ?? projectsData.viewer
    const projects = owner?.projects?.edges

    if (projects) return getSteps(projects, term)
    return []
  }

  return (
    <FieldInput
      {...props}
      placeholder={intl.formatMessage({ id: 'select-steps' })}
      control={control}
      // @ts-ignore TODO update form
      filterOption={option => projectIds.includes(option.data.projectId)}
      type="select"
      name={name}
      defaultOptions
      loadOptions={loadOptions}
      disabled={disabled}
    />
  )
}

export default StepListField
