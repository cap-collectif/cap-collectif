import React from 'react'
import { graphql, useFragment } from 'react-relay'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import { Field } from 'redux-form'
import select from '../../Form/Select'
import type { SelectStep_projectOwner$key } from '~relay/SelectStep_projectOwner.graphql'
type Props = {
  readonly projectOwner: SelectStep_projectOwner$key
  readonly multi: boolean
  readonly clearable: boolean
  readonly name: string
  readonly label: string
  readonly optional: boolean
  readonly disabled: boolean
  readonly projectIds: Array<string>
}
const FRAGMENT = graphql`
  fragment SelectStep_projectOwner on ProjectOwner
  @argumentDefinitions(affiliations: { type: "[ProjectAffiliation!]" }) {
    projects(affiliations: $affiliations) {
      edges {
        node {
          id
          title
          steps {
            id
            title
          }
        }
      }
    }
  }
`

const renderLabel = (intl: IntlShape, label: string, optional: boolean) => {
  const message = intl.formatMessage({
    id: label,
  })
  return optional ? (
    <div>
      {message}
      <div className="excerpt inline">
        {intl.formatMessage({
          id: 'global.optional',
        })}
      </div>
    </div>
  ) : (
    message
  )
}

export const SelectStep = ({
  projectOwner,
  projectIds,
  multi = false,
  clearable = false,
  name = 'step',
  label = 'step.select',
  optional = false,
  disabled = false,
}: Props) => {
  const { projects } = useFragment(FRAGMENT, projectOwner)
  const intl = useIntl()

  const getSteps = () => {
    const steps = []

    ;(() =>
      projects &&
      projects.edges &&
      projects.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(node => {
          if (projectIds !== null && projectIds.length > 0) {
            return projectIds.includes(node.id) ? node.steps : null
          }

          return node.steps
        })
        .filter(Boolean)
        .forEach(projectSteps => {
          projectSteps.forEach(step =>
            steps.push({
              value: step.id,
              label: step.title,
            }),
          )
        }))()

    return steps
  }

  return (
    <Field
      component={select}
      id="SelectStep-filter"
      name={name}
      placeholder={intl.formatMessage({
        id: 'step.select',
      })}
      label={renderLabel(intl, label, optional)}
      options={getSteps()}
      role="combobox"
      aria-autocomplete="list"
      aria-haspopup="true"
      aria-controls="SelectStep-filter-listbox"
      multi={multi}
      clearable={clearable}
      disabled={disabled}
    />
  )
}
export default SelectStep
