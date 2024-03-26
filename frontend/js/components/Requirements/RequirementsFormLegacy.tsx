import React from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { graphql, createFragmentContainer } from 'react-relay'
import {
  reduxForm,
  Field,
  startSubmit,
  stopSubmit,
  stopAsyncValidation,
  isPristine,
  change as changeRF,
  formValueSelector,
} from 'redux-form'
import { fetchQuery_DEPRECATED } from 'relay-runtime'
import component from '../Form/Field'
import UpdateRequirementMutation from '../../mutations/UpdateRequirementMutation'
import UpdateProfilePersonalDataMutation from '../../mutations/UpdateProfilePersonalDataMutation'
import type { CheckIdentificationCodeMutationResponse } from '../../mutations/CheckIdentificationCodeMutation'
import CheckIdentificationCodeMutation from '../../mutations/CheckIdentificationCodeMutation'
import type { Dispatch, State } from '~/types'
import DateDropdownPicker from '../Form/DateDropdownPicker'
import environment from '../../createRelayEnvironment'
import LoginSocialButton from '~ui/Button/LoginSocialButton'
import AppBox from '~ui/Primitives/AppBox'
import type { RequirementsFormLegacy_step } from '~relay/RequirementsFormLegacy_step.graphql'
export const formName = 'requirements-form'
const CODE_MINIMAL_LENGTH = 8
type GoogleMapsAddress = {
  readonly formatted: string | null | undefined
  readonly json: string
}
type Requirement = {
  readonly __typename: string
  readonly id: string
  readonly viewerMeetsTheRequirement?: boolean
  readonly viewerDateOfBirth?: string | null | undefined
  readonly viewerAddress?: GoogleMapsAddress | null | undefined
  readonly viewerValue?: string | null | undefined
  readonly label?: string
}
type FormValues = Record<string, (string | null | undefined) | boolean>
type Props = ReduxFormFormProps & {
  stepId?: string | null | undefined
  step: RequirementsFormLegacy_step
  isAuthenticated: boolean
  pristine: boolean
  isIdentificationCodeValid: boolean
  onValidate?: (errors: any) => void
}
export const refetchViewer = graphql`
  query RequirementsFormLegacy_userQuery($stepId: ID!, $isAuthenticated: Boolean!) {
    step: node(id: $stepId) {
      ... on RequirementStep {
        ...RequirementsFormLegacy_step @arguments(isAuthenticated: $isAuthenticated)
        requirements {
          viewerMeetsTheRequirements @include(if: $isAuthenticated)
        }
      }
    }
  }
`
const callApiTimeout: Record<string, TimeoutID> = {}

const checkIdentificationCode = async (identificationCode: string): Promise<string | null | undefined> => {
  const response: CheckIdentificationCodeMutationResponse = await CheckIdentificationCodeMutation.commit({
    input: {
      identificationCode,
    },
  })
  return response?.checkIdentificationCode?.errorCode ?? null
}

const asyncValidate = async (values: FormValues, dispatch: Dispatch, props: Props): Promise<any> => {
  const identificationCodeRequirementEdge = props?.step?.requirements?.edges?.find(
    edge => edge?.node?.__typename === 'IdentificationCodeRequirement',
  )

  if (!identificationCodeRequirementEdge) {
    return Promise.resolve()
  }

  const identificationCodeRequirement = identificationCodeRequirementEdge.node

  if (identificationCodeRequirement.viewerValue) {
    return Promise.resolve()
  }

  if (!values[identificationCodeRequirement.id]) {
    return Promise.resolve()
  }

  if (values[`${identificationCodeRequirement.id}_valid`] === true) {
    return Promise.resolve()
  }

  const newValue = String(values[identificationCodeRequirement.id]).toUpperCase()

  if (newValue.length < CODE_MINIMAL_LENGTH) {
    const errors: any = {}
    errors[identificationCodeRequirement.id] = 'BAD_CODE'
    return Promise.reject(errors)
  }

  try {
    const errors: any = {}
    const checkIdentificationErrorCode = await checkIdentificationCode(newValue)

    if (checkIdentificationErrorCode) {
      errors[identificationCodeRequirement.id] = checkIdentificationErrorCode
      dispatch(changeRF(formName, `${identificationCodeRequirement.id}_valid`, false))
      dispatch(changeRF(formName, 'form_valid', false))
      return Promise.reject(errors)
    }

    dispatch(startSubmit(formName))
    await UpdateProfilePersonalDataMutation.commit({
      input: {
        userIdentificationCode: newValue,
      },
    })
    dispatch(changeRF(formName, `${identificationCodeRequirement.id}_valid`, true))
    dispatch(changeRF(formName, `${identificationCodeRequirement.id}`, newValue))
    dispatch(changeRF(formName, 'form_valid', true))
    errors[identificationCodeRequirement.id] = undefined
    dispatch(stopSubmit(formName))
    dispatch(stopAsyncValidation(formName))
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

export const validate = (values: FormValues, props: Props) => {
  const errors: any = {}
  const { edges } = props.step.requirements

  if (!edges) {
    return errors
  }

  if (values.form_valid === false) {
    errors.form_valid = 'global.required'
  }

  for (const edge of edges.filter(Boolean)) {
    const requirement = edge.node

    if (requirement.__typename === 'PhoneRequirement') {
      const phone = values[requirement.id]

      if (typeof phone === 'string') {
        const countryCode = phone.slice(0, 3)
        const remainingPhone = phone.slice(3)

        if (countryCode !== '+33') {
          errors[requirement.id] = 'phone.validation.start.by.plus.thirty.three'
        } else if (!/^[0-9]+$/.test(remainingPhone) || remainingPhone.length !== 9) {
          errors[requirement.id] = 'profile.constraints.phone.invalid'
        }
      }
    } else if (requirement.__typename === 'IdentificationCodeRequirement') {
      if (!values[requirement.id]) {
        errors[requirement.id] = 'global.required'
      } else if (values[`${requirement.id}_valid`] === false) {
        errors[`${requirement.id}_valid`] = 'global.required'
      }
    } else if (!values[requirement.id] && requirement.__typename !== 'IdentificationCodeRequirement') {
      const fieldName = requirement.__typename === 'PostalAddressRequirement' ? 'PostalAddressText' : requirement.id
      errors[fieldName] = 'global.required'
    }
  }
  if (props.onValidate) props.onValidate(errors)
  return errors
}
export const onChange = (values: FormValues, dispatch: Dispatch, props: Props, previousValues: FormValues): void => {
  if (props.pristine) {
    return
  }

  Object.keys(values).forEach(element => {
    if (previousValues[element] !== values[element]) {
      const requirementEdge =
        props.step.requirements.edges &&
        props.step.requirements.edges?.filter(edge => edge?.node?.id === element).length > 0
          ? props.step.requirements.edges?.find(edge => edge?.node?.id === element)
          : props.step.requirements.edges?.find(edge => edge?.node?.__typename === element)

      if (!requirementEdge) {
        return
      }

      const requirement = requirementEdge.node
      const newValue = values[element]

      // Check that the new phone value is valid
      if (
        requirement.__typename === 'PhoneRequirement' &&
        typeof validate(values, props)[requirement.id] !== 'undefined'
      ) {
        return
      }

      if (typeof newValue !== 'string') {
        if (requirement.__typename === 'CheckboxRequirement' && typeof newValue === 'boolean') {
          // The user just (un-)checked a box, so we can call our API directly
          dispatch(startSubmit(formName))
          return UpdateRequirementMutation.commit({
            input: {
              requirement: requirement.id,
              value: newValue,
            },
          }).then(() => {
            dispatch(stopSubmit(formName))

            if (props.stepId) {
              fetchQuery_DEPRECATED(environment, refetchViewer, {
                stepId: props.stepId,
                isAuthenticated: props.isAuthenticated,
              })
            }
          })
        }

        return
      }

      // skip identificationCode, the update is in asyncValidate
      if (requirement.__typename === 'IdentificationCodeRequirement') {
        return
      }

      const input = {}

      if (requirement.__typename === 'DateOfBirthRequirement') {
        input.dateOfBirth = newValue
      }

      if (requirement.__typename === 'PostalAddressRequirement') {
        input.postalAddress = newValue
      }

      if (requirement.__typename === 'FirstnameRequirement') {
        input.firstname = newValue
      }

      if (requirement.__typename === 'LastnameRequirement') {
        input.lastname = newValue
      }

      if (requirement.__typename === 'PhoneRequirement') {
        input.phone = newValue
      }

      if (Object.keys(input).length < 1) {
        return
      }

      // To handle realtime updates
      // we call the api after 1 second inactivity
      // on each updated field, using timeout
      const timeout = callApiTimeout[requirement.id]

      if (timeout) {
        clearTimeout(timeout)
      }

      dispatch(startSubmit(formName))
      dispatch(changeRF(formName, 'form_valid', false))
      callApiTimeout[requirement.id] = setTimeout(() => {
        UpdateProfilePersonalDataMutation.commit({
          input,
        }).then(() => {
          dispatch(stopSubmit(formName))
          dispatch(changeRF(formName, 'form_valid', true))

          if (props.stepId) {
            fetchQuery_DEPRECATED(environment, refetchViewer, {
              stepId: props.stepId,
              isAuthenticated: props.isAuthenticated,
            })
          }
        })
      }, 1000)
    }
  })
}

const getLabel = (requirement: Requirement) => {
  if (requirement.__typename === 'FirstnameRequirement') {
    return <FormattedMessage id="form.label_firstname" />
  }

  if (requirement.__typename === 'LastnameRequirement') {
    return <FormattedMessage id="global.name" />
  }

  if (requirement.__typename === 'PhoneRequirement') {
    return <FormattedMessage id="mobile-phone" />
  }

  if (requirement.__typename === 'DateOfBirthRequirement') {
    return <FormattedMessage id="form.label_date_of_birth" />
  }

  if (requirement.__typename === 'PostalAddressRequirement') {
    return <FormattedMessage id="admin.fields.event.address" />
  }

  if (requirement.__typename === 'IdentificationCodeRequirement') {
    return <FormattedMessage id="identification_code" />
  }

  if (requirement.__typename === 'FranceConnectRequirement') {
    return <FormattedMessage id="france_connect" />
  }

  if (requirement.__typename === 'PhoneVerifiedRequirement') {
    return <FormattedMessage id="verify.number.sms" />
  }

  return ''
}

const getFormProps = (requirement: Requirement, change: any) => {
  if (requirement.__typename === 'DateOfBirthRequirement') {
    return {
      component: DateDropdownPicker,
      globalClassName: 'col-sm-12 col-xs-12',
      divClassName: 'd-flex mb-15',
      css: {
        label: {
          fontSize: 18,
          marginBottom: 10,
        },
        'label + div': {
          gap: 10,
        },
      },
    }
  }

  if (requirement.__typename === 'PostalAddressRequirement') {
    return {
      component,
      type: 'address',
      divClassName: 'col-sm-12 col-xs-12',
      addressProps: {
        getAddress: addressComplete => change(requirement.id, JSON.stringify([addressComplete])),
      },
    }
  }

  if (requirement.__typename === 'CheckboxRequirement') {
    return {
      component,
      type: 'checkbox',
      divClassName: 'col-sm-12 col-xs-12',
    }
  }

  return {
    component,
    type: 'text',
    divClassName: 'col-sm-12 col-xs-12',
  }
}

export const RequirementsFormLegacy = ({
  step,
  submitting,
  submitSucceeded,
  change,
  isIdentificationCodeValid,
}: Props) => {
  const requirements = step.requirements?.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(requirement => requirement.__typename !== 'PhoneVerifiedRequirement')
  return (
    <form>
      {(submitting || submitSucceeded) && (
        <div className="col-sm-12 col-xs-12 alert__form_succeeded-message">
          {submitting ? (
            <div>
              <i
                className="cap cap-spinner"
                style={{
                  display: 'inline-block',
                  animation: 'spin 1s linear infinite',
                }}
              />{' '}
              <FormattedMessage id="current-registration" />
            </div>
          ) : submitSucceeded ? (
            <div>
              <i className="cap cap-android-checkmark-circle" /> <FormattedMessage id="global.saved" />
            </div>
          ) : null}
        </div>
      )}

      {requirements &&
        requirements.length > 0 &&
        requirements.map(requirement => {
          if (requirement.__typename === 'FranceConnectRequirement' && !requirement.viewerValue) {
            return (
              <AppBox justifyContent="left" textAlign="left">
                <LoginSocialButton justifyContent="left" type="franceConnect" noHR />
              </AppBox>
            )
          }

          return (
            <Field
              addonBefore={requirement.__typename === 'PhoneRequirement' ? 'France +33' : undefined}
              minlength={requirement.__typename === 'IdentificationCodeRequirement' ? CODE_MINIMAL_LENGTH : undefined}
              id={
                requirement.__typename === 'IdentificationCodeRequirement'
                  ? 'IdentificationCodeRequirement'
                  : requirement.id
              }
              key={requirement.id}
              disabled={
                requirement.__typename === 'IdentificationCodeRequirement' &&
                (requirement.viewerValue || isIdentificationCodeValid)
              }
              placeholder={
                requirement.__typename === 'IdentificationCodeRequirement' && !requirement.viewerValue
                  ? 'Ex: 25FOVC10'
                  : null
              }
              name={requirement.__typename === 'PostalAddressRequirement' ? 'PostalAddressText' : requirement.id}
              label={requirement.__typename !== 'CheckboxRequirement' && getLabel(requirement)}
              {...getFormProps(requirement, change)}
            >
              {requirement.__typename === 'CheckboxRequirement' ? requirement.label : null}
            </Field>
          )
        })}
    </form>
  )
}
const form = reduxForm({
  onChange,
  validate,
  asyncValidate,
  form: formName,
})(RequirementsFormLegacy)

const getRequirementInitialValue = (requirement: Requirement): (string | null | undefined) | boolean => {
  if (requirement.__typename === 'CheckboxRequirement') {
    return requirement.viewerMeetsTheRequirement
  }

  if (requirement.__typename === 'PhoneRequirement') {
    return requirement.viewerValue ? requirement.viewerValue : null
  }

  if (requirement.__typename === 'DateOfBirthRequirement') {
    return requirement.viewerDateOfBirth
  }

  if (requirement.__typename === 'PostalAddressRequirement') {
    return requirement.viewerAddress ? requirement.viewerAddress.json : null
  }

  return requirement.viewerValue
}

const mapStateToProps = (state: State, { step }: Props) => {
  const identificationCode = step.requirements.edges?.find(
    edge => edge?.node?.__typename === 'IdentificationCodeRequirement',
  )
  const selector = formValueSelector(formName)
  const isIdentificationCodeValid = identificationCode?.node?.id
    ? selector(state, `${identificationCode?.node?.id}_valid`)
    : false
  const requirements = step.requirements.edges ? step.requirements.edges.filter(Boolean).map(edge => edge.node) : []
  return {
    isAuthenticated: !!state.user.user,
    pristine: isPristine(formName)(state),
    isIdentificationCodeValid,
    initialValues:
      requirements.length > 0
        ? requirements.reduce(
            (initialValues, requirement) => {
              const value = getRequirementInitialValue(requirement)

              if (requirement.__typename === 'PostalAddressRequirement') {
                return {
                  ...initialValues,
                  PostalAddressText: requirement.viewerAddress ? requirement.viewerAddress.formatted : null,
                  [requirement.id]: value,
                }
              }

              if (requirement.__typename === 'IdentificationCodeRequirement') {
                return { ...initialValues, [requirement.id]: value, [`${requirement.id}_valid`]: !!value }
              }

              return { ...initialValues, [requirement.id]: value }
            },
            {
              form_valid: requirements.every(requirement => requirement.viewerMeetsTheRequirement === true),
            },
          )
        : {},
  }
}

// @ts-ignore
const container = connect(mapStateToProps)(form)
export default createFragmentContainer(container, {
  step: graphql`
    fragment RequirementsFormLegacy_step on RequirementStep
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      requirements {
        edges {
          node {
            __typename
            id
            viewerMeetsTheRequirement @include(if: $isAuthenticated)
            ... on DateOfBirthRequirement {
              viewerDateOfBirth @include(if: $isAuthenticated)
            }
            ... on PostalAddressRequirement {
              viewerAddress @include(if: $isAuthenticated) {
                formatted
                json
              }
            }
            ... on FirstnameRequirement {
              viewerValue @include(if: $isAuthenticated)
            }
            ... on LastnameRequirement {
              viewerValue @include(if: $isAuthenticated)
            }
            ... on PhoneRequirement {
              viewerValue @include(if: $isAuthenticated)
            }
            ... on IdentificationCodeRequirement {
              viewerValue @include(if: $isAuthenticated)
            }
            ... on FranceConnectRequirement {
              viewerValue @include(if: $isAuthenticated)
            }
            ... on CheckboxRequirement {
              label
            }
          }
        }
      }
    }
  `,
})
