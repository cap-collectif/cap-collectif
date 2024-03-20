import React from 'react'
import { graphql, useFragment } from 'react-relay'
import { Box } from '@cap-collectif/ui'
import { FragmentRefs } from 'relay-runtime'
import CheckBoxRequirementsList from '@components/Requirements/CheckBoxRequirementsList'
import { Requirements_requirementStep$key } from '@relay/Requirements_requirementStep.graphql'
import ToggleRequirementsList from '@components/Requirements/ToggleRequirementsList'
import RequirementsReason from '@components/Requirements/RequirementsReason'
import { KeyTypeData } from 'react-relay/relay-hooks/helpers'

type Props = {
  requirementStep: Requirements_requirementStep$key
}

export type RequirementNode = {
  readonly id: string
  readonly __typename: string
  readonly ' $fragmentRefs': FragmentRefs<'RequirementItem_requirement'>
  readonly label?: string | undefined
}

export type ToggleRequirement = {
  id: string
  typename: RequirementTypeName
  isChecked: boolean
  disabled: boolean
  isCollectedByFranceConnect?: boolean
}

const REQUIREMENT_STEP_FRAGMENT = graphql`
  fragment Requirements_requirementStep on RequirementStep {
    requirements {
      edges {
        node {
          id
          __typename
          ... on CheckboxRequirement {
            label
          }
          ... on DataCollectedByFranceConnectRequirement {
            isCollectedByFranceConnect
          }
        }
      }
    }
    allRequirements {
      edges {
        node {
          __typename
          ... on CheckboxRequirement {
            label
          }
          ... on DataCollectedByFranceConnectRequirement {
            isCollectedByFranceConnect
          }
        }
      }
    }
  }
`

export type RequirementTypeName =
  | 'FirstnameRequirement'
  | 'LastnameRequirement'
  | 'PhoneRequirement'
  | 'DateOfBirthRequirement'
  | 'PostalAddressRequirement'
  | 'IdentificationCodeRequirement'
  | 'PhoneVerifiedRequirement'
  | 'FranceConnectRequirement'

export type RequirementApiTypeName =
  | 'FIRSTNAME'
  | 'LASTNAME'
  | 'PHONE'
  | 'DATE_OF_BIRTH'
  | 'POSTAL_ADDRESS'
  | 'IDENTIFICATION_CODE'
  | 'PHONE_VERIFIED'
  | 'FRANCE_CONNECT'
  | 'CHECKBOX'

export type Requirement = {
  isChecked?: boolean
  id: string
  label: string | undefined
  typename: RequirementApiTypeName
}

export const config: Record<
  RequirementTypeName,
  {
    title: string
    apiTypename: RequirementApiTypeName
  }
> = {
  FirstnameRequirement: {
    title: 'form.label_firstname',
    apiTypename: 'FIRSTNAME',
  },
  LastnameRequirement: {
    title: 'global.name',
    apiTypename: 'LASTNAME',
  },
  PhoneRequirement: {
    title: 'filter.label_phone',
    apiTypename: 'PHONE',
  },
  PhoneVerifiedRequirement: {
    title: 'verify.number.sms',
    apiTypename: 'PHONE_VERIFIED',
  },
  DateOfBirthRequirement: {
    title: 'form.label_date_of_birth',
    apiTypename: 'DATE_OF_BIRTH',
  },
  PostalAddressRequirement: {
    title: 'admin.fields.event.address',
    apiTypename: 'POSTAL_ADDRESS',
  },
  IdentificationCodeRequirement: {
    title: 'identification_code',
    apiTypename: 'IDENTIFICATION_CODE',
  },
  FranceConnectRequirement: {
    title: 'france_connect',
    apiTypename: 'FRANCE_CONNECT',
  },
}

export type RequirementsFormValues = {
  requirementsReason: string
  requirements: Array<Requirement>
}

export const getRequirementsInput = <FormValues extends RequirementsFormValues>(values: FormValues) => {
  return {
    requirementsReason: values.requirementsReason,
    requirements: values.requirements
      .filter(requirement => {
        if (requirement?.typename === 'CHECKBOX') {
          return !!requirement.label
        }
        return requirement.isChecked
      })
      .map(requirement => ({ id: requirement.id, label: requirement.label, type: requirement.typename })),
  }
}

const getToggleRequirements = (step: KeyTypeData<Requirements_requirementStep$key>) => {
  const allRequirements = step.allRequirements.edges.map(edge => edge.node)

  const stepRequirements =
    step?.requirements?.edges?.map(edge => edge?.node).filter((node): node is RequirementNode => !!node) ?? []

  const toggleRequirements: Array<ToggleRequirement> = allRequirements.map(requirement => {
    const typename = requirement.__typename
    const stepRequirement = stepRequirements.find(requirement => requirement.__typename === typename)
    return {
      id: stepRequirement?.id ?? null,
      typename: typename as RequirementTypeName,
      isChecked: !!stepRequirement,
      disabled: false,
      isCollectedByFranceConnect: requirement?.isCollectedByFranceConnect ?? false,
    }
  })
  return toggleRequirements
}

export const getDefaultRequirements = (step: KeyTypeData<Requirements_requirementStep$key>) => {
  const toggleRequirements = getToggleRequirements(step)

  const stepRequirements =
    step?.requirements?.edges?.map(edge => edge?.node).filter((node): node is RequirementNode => !!node) ?? []

  const defaultCheckBoxRequirements = stepRequirements
    .filter(requirement => requirement.__typename === 'CheckboxRequirement')
    .map(({ id, label }) => {
      return {
        id,
        label: label ?? '',
        typename: 'CHECKBOX' as RequirementApiTypeName,
      }
    })

  const defaultRequirements = toggleRequirements
    .map(requirement => {
      return {
        id: requirement.id,
        label: '',
        typename: config[requirement.typename].apiTypename,
        isCollectedByFranceConnect: requirement.isCollectedByFranceConnect,
        isChecked: requirement.isChecked,
      }
    })
    // @ts-ignore
    .concat(defaultCheckBoxRequirements)

  return defaultRequirements
}

const Requirements: React.FC<Props> = ({ requirementStep: requirementStepRef }) => {
  const step = useFragment<Requirements_requirementStep$key>(REQUIREMENT_STEP_FRAGMENT, requirementStepRef)

  const toggleRequirements = getToggleRequirements(step)

  return (
    <Box>
      <RequirementsReason />
      <ToggleRequirementsList toggleRequirements={toggleRequirements} />
      <CheckBoxRequirementsList />
    </Box>
  )
}

export default Requirements
