import * as React from 'react'
import { connect } from 'react-redux'
import { FormattedHTMLMessage, FormattedMessage, useIntl } from 'react-intl'
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup } from 'react-bootstrap'
import type { DropResult, DraggableProvided, DroppableProvided } from 'react-beautiful-dnd'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { arrayMove, Field, change, arrayRemove } from 'redux-form'
import { Flex, Text } from '@cap-collectif/ui'
import toggle from '~/components/Form/Toggle'
import InputRequirement from '~/components/Ui/Form/InputRequirement'
import type { RequirementType } from '~relay/UpdateProjectAlphaMutation.graphql'
import { RequirementDragItem, CheckboxPlaceholder, RequirementSubItem } from './ProjectAdminStepForm.style'
import type { Dispatch, Uuid } from '~/types'
import type { FranceConnectAllowedData } from '~/components/Admin/Project/Step/ProjectAdminStepForm'
import '~/components/Admin/Project/Step/ProjectAdminStepForm'
import InfoMessage from '~ds/InfoMessage/InfoMessage'
import component from '~/components/Form/Field'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

export type Requirement = {
  type: RequirementType | string
  checked?: boolean
  label?: string | null | undefined
  id?: string | null | undefined
  uniqueId?: string | null | undefined
  disabled?: boolean | null | undefined
}
type Props = ReduxFormFieldArrayProps & {
  requirements: Array<Requirement>
  fcAllowedData: FranceConnectAllowedData
  dispatch: Dispatch
  formName: string
  meta?: {
    error: string | null | undefined
  }
  onInputCheck: (value: boolean, field: string, requirement: Requirement) => void
  onInputChange: (value: string, field: string, requirement: Requirement) => void
  onInputDelete: (index: number) => void
  isFranceConnectConfigured: boolean
  stepType: 'CollectStep' | 'SelectionStep' | 'ConsultationStep' | 'QuestionnaireStep'
}
export const getUId = (): Uuid => `_${Math.random().toString(36).substr(2, 9)}`

const requirementFactory = (
  type: RequirementType,
  checked: boolean,
  label: string,
  id?: string | null | undefined,
  disabled: boolean | null | undefined = false,
): Requirement => ({
  type,
  checked,
  label,
  id,
  uniqueId: getUId(),
  disabled,
})

export const formatRequirements = (requirements: Array<Requirement>) =>
  requirements
    .filter(r => r.checked !== false)
    .map<Requirement>(r => ({
      ...r,
      uniqueId: undefined,
      checked: undefined,
      disabled: undefined,
      label: r.type === 'CHECKBOX' ? r.label : null,
    }))
export const doesStepSupportRequirements = (step: {
  __typename: string
  requirements?: Array<Requirement> | null | undefined
}): boolean => {
  return (
    step.__typename === 'CollectStep' ||
    step.__typename === 'SelectionStep' ||
    step.__typename === 'ConsultationStep' ||
    step.__typename === 'QuestionnaireStep'
  )
}
export function createRequirements(
  step: {
    __typename: string
    requirements?: Array<Requirement> | null | undefined
  },
  twilioEnabled: boolean | null | undefined,
  isFranceConnectConfigured: boolean,
  fcAllowedData: FranceConnectAllowedData,
  isAdmin: boolean = false,
): Array<Requirement> {
  const requirements = []

  if (!doesStepSupportRequirements(step)) {
    return requirements
  }

  const isSupportingPhoneVerifiedRequirement =
    (step.__typename === 'CollectStep' || step.__typename === 'SelectionStep' || step.__typename === 'QuestionnaireStep') && twilioEnabled
  const initialRequirements = step.requirements || []
  if (!initialRequirements.some((r: Requirement) => r.type === 'EMAIL_VERIFIED') && step.__typename === 'QuestionnaireStep') {
    requirements.push(requirementFactory('EMAIL_VERIFIED', false, 'user_email', null, false))
  }
  if (!initialRequirements.some((r: Requirement) => r.type === 'FIRSTNAME'))
    requirements.push(requirementFactory('FIRSTNAME', false, 'form.label_firstname', null, false))
  if (!initialRequirements.some((r: Requirement) => r.type === 'LASTNAME'))
    requirements.push(requirementFactory('LASTNAME', false, 'global.name', null, false))
  if (!initialRequirements.some((r: Requirement) => r.type === 'PHONE'))
    requirements.push(requirementFactory('PHONE', false, 'filter.label_phone', null))
  if (!initialRequirements.some((r: Requirement) => r.type === 'DATE_OF_BIRTH'))
    requirements.push(requirementFactory('DATE_OF_BIRTH', false, 'form.label_date_of_birth', null, false))
  if (!initialRequirements.some((r: Requirement) => r.type === 'POSTAL_ADDRESS'))
    requirements.push(requirementFactory('POSTAL_ADDRESS', false, 'admin.fields.event.address', null))
  if (!initialRequirements.some((r: Requirement) => r.type === 'ZIP_CODE') && step.__typename === 'QuestionnaireStep')
    requirements.push(requirementFactory('ZIP_CODE', false, 'user.register.zipcode', null, false))
  if (!initialRequirements.some((r: Requirement) => r.type === 'IDENTIFICATION_CODE') && isAdmin)
    requirements.push(requirementFactory('IDENTIFICATION_CODE', false, 'identification_code', null))

  if (
    !initialRequirements.some((r: Requirement) => r.type === 'PHONE_VERIFIED') &&
    isSupportingPhoneVerifiedRequirement
  ) {
    requirements.push(requirementFactory('PHONE_VERIFIED', false, 'verify.number.sms', null))
  }

  if (!initialRequirements.some((r: Requirement) => r.type === 'FRANCE_CONNECT') && isFranceConnectConfigured) {
    requirements.push(requirementFactory('FRANCE_CONNECT', false, 'france_connect', null))
  }

  initialRequirements.forEach((requirement: Requirement) => {
    if (requirement.type === 'PHONE_VERIFIED' && isSupportingPhoneVerifiedRequirement) {
      requirements.push(requirementFactory('PHONE_VERIFIED', true, 'verify.number.sms', requirement.id))
    }

    switch (requirement.type) {
      case 'EMAIL_VERIFIED':
        if (step.__typename === 'QuestionnaireStep') {
          requirements.push(requirementFactory('EMAIL_VERIFIED', true, 'user_email', requirement.id))
        }
        break
      case 'FIRSTNAME':
        requirements.push(requirementFactory('FIRSTNAME', true, 'form.label_firstname', requirement.id))
        break

      case 'LASTNAME':
        requirements.push(requirementFactory('LASTNAME', true, 'global.name', requirement.id))
        break

      case 'PHONE':
        requirements.push(requirementFactory('PHONE', true, 'filter.label_phone', requirement.id))
        break
      case 'PHONE_VERIFIED':
        if (isSupportingPhoneVerifiedRequirement) {
          requirements.push(requirementFactory('PHONE_VERIFIED', true, 'verify.number.sms', requirement.id))
        }
        break
      case 'ZIP_CODE':
        if (step.__typename === 'QuestionnaireStep') {
          requirements.push(requirementFactory('ZIP_CODE', true, 'user.register.zipcode', requirement.id))
        }
        break
      case 'DATE_OF_BIRTH':
        requirements.push(requirementFactory('DATE_OF_BIRTH', true, 'form.label_date_of_birth', requirement.id))
        break

      case 'POSTAL_ADDRESS':
        requirements.push(requirementFactory('POSTAL_ADDRESS', true, 'admin.fields.event.address', requirement.id))
        break

      case 'CHECKBOX':
        requirements.push(requirementFactory('CHECKBOX', true, requirement?.label || '', requirement.id))
        break

      case 'IDENTIFICATION_CODE':
        requirements.push(requirementFactory('IDENTIFICATION_CODE', true, 'identification_code', requirement.id))
        break

      case 'FRANCE_CONNECT':
        if (isFranceConnectConfigured) {
          Array.from(requirements).forEach(r => {
            if (r.type === 'LASTNAME' && fcAllowedData.LASTNAME) {
              r.disabled = true
            }

            if (r.type === 'FIRSTNAME' && fcAllowedData.FIRSTNAME) {
              r.disabled = true
            }

            if (r.type === 'DATE_OF_BIRTH' && fcAllowedData.DATE_OF_BIRTH) {
              r.disabled = true
            }
          })
          requirements.push(requirementFactory('FRANCE_CONNECT', true, 'france_connect', requirement.id))
        }

        break

      default:
    }
  })
  return requirements
}
export function StepRequirementsList({
  dispatch,
  formName,
  fields,
  requirements,
  onInputChange,
  onInputCheck,
  onInputDelete,
  fcAllowedData,
  isFranceConnectConfigured,
  stepType,
}: Props) {
  const intl = useIntl()

  const onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    dispatch(arrayMove(formName, 'requirements', result.source.index, result.destination.index))
  }

  const lastNameRequirement = requirements.filter(r => r && r.type === 'LASTNAME')
  const firstNameRequirement = requirements.filter(r => r && r.type === 'FIRSTNAME')
  const birthDateRequirement = requirements.filter(r => r && r.type === 'DATE_OF_BIRTH')
  const fcRequirement = ['LASTNAME', 'FIRSTNAME', 'DATE_OF_BIRTH']
  const [enableFranceConnect, setEnableFranceConnect] = React.useState<boolean | null | undefined>(null)

  /* # Requirement => Phone verified # */
  const hasFeatureTwilio = useFeatureFlag('twilio')
  const hasPhoneVerifiedEnabled = stepType === 'CollectStep' || stepType === 'SelectionStep' || stepType === 'QuestionnaireStep'
  const phoneVerifiedRequirementIndex = requirements.findIndex(requirement => requirement.type === 'PHONE_VERIFIED')
  const phoneVerifiedRequirement = requirements[phoneVerifiedRequirementIndex]
  return (
    <ListGroup>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppableRequirement">
          {(provided: DroppableProvided) => (
            <div ref={provided.innerRef}>
              {fields.map((field: string, index: number) => {
                const requirement = requirements[index]
                if (!requirement || requirement.type === 'PHONE_VERIFIED') return
                const hasPhoneVerifiedDisplay = requirement.type === 'PHONE' && requirement.checked
                let requirementExist = false

                // Cannot get fcAllowedData[requirement.type] because property CHECKBOX is missing in FranceConnectAllowedData [1].
                if (requirement.type in fcAllowedData && typeof fcAllowedData[requirement.type] !== 'undefined') {
                  requirementExist = fcAllowedData[requirement.type]
                }

                const isToggle = requirement.type !== 'CHECKBOX'
                const id = `requirement.${requirement.id || requirement.uniqueId || ''}`

                if (requirement.type === 'FRANCE_CONNECT') {
                  setEnableFranceConnect(requirement.checked)
                }

                return (
                  <Draggable key={id} draggableId={id} index={index}>
                    {(providedDraggable: DraggableProvided) => (
                      <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                      >
                        <RequirementDragItem key={index}>
                          <i className="cap cap-android-menu" />
                          {isToggle ? (
                            <Field
                              id={`requirement-${index}`}
                              name={requirement.label}
                              className={requirement.type}
                              component={toggle}
                              disabled={requirement.disabled}
                              props={{
                                input: {
                                  value: requirement.checked,
                                  name: requirement.type,
                                  onChange: () => {
                                    if (requirement.type === 'FRANCE_CONNECT') {
                                      setEnableFranceConnect(requirement.checked)

                                      if (lastNameRequirement && fcAllowedData.LASTNAME === true) {
                                        Array.from(requirements).forEach(function (r, rIndex) {
                                          if (r.type === 'LASTNAME') {
                                            dispatch(
                                              change(formName, `requirements[${rIndex}]`, {
                                                ...r,
                                                checked: false,
                                                disabled: !requirement.checked,
                                              }),
                                            )
                                          }
                                        })
                                      }

                                      if (firstNameRequirement && fcAllowedData.FIRSTNAME === true) {
                                        Array.from(requirements).forEach(function (r, rIndex) {
                                          if (r.type === 'FIRSTNAME') {
                                            dispatch(
                                              change(formName, `requirements[${rIndex}]`, {
                                                ...r,
                                                checked: false,
                                                disabled: !requirement.checked,
                                              }),
                                            )
                                          }
                                        })
                                      }

                                      if (birthDateRequirement && fcAllowedData.DATE_OF_BIRTH === true) {
                                        Array.from(requirements).forEach(function (r, rIndex) {
                                          if (r.type === 'DATE_OF_BIRTH') {
                                            dispatch(
                                              change(formName, `requirements[${rIndex}]`, {
                                                ...r,
                                                checked: false,
                                                disabled: !requirement.checked,
                                              }),
                                            )
                                          }
                                        })
                                      }
                                    }

                                    if (requirement.type === 'PHONE') {
                                      // When PhoneRequirement is unchecked
                                      if (requirement.checked && phoneVerifiedRequirementIndex > 0) {
                                        onInputCheck(
                                          false,
                                          `requirements[${phoneVerifiedRequirementIndex}]`,
                                          phoneVerifiedRequirement,
                                        )
                                      }
                                    }

                                    onInputCheck(!requirement.checked, field, requirements[index])
                                  },
                                },
                              }}
                              label={
                                <p
                                  style={{
                                    marginBottom: 0,
                                    color: `${requirement.disabled ? '#707070' : 'inherit'}`,
                                  }}
                                >
                                  <FormattedMessage id={requirement.label || ''} />
                                </p>
                              }
                            />
                          ) : (
                            <>
                              <CheckboxPlaceholder>
                                <i className="fa fa-check" />
                              </CheckboxPlaceholder>
                              <Field
                                name={field}
                                component={InputRequirement}
                                props={{
                                  placeholder: intl.formatMessage({
                                    id: 'enter-label',
                                  }),
                                  onChange: (value: string) => {
                                    onInputChange(value, field, requirements[index])
                                  },
                                  onDelete: () => {
                                    onInputDelete(index)
                                  },
                                  initialValue: requirement.label,
                                }}
                              />
                            </>
                          )}
                          {isFranceConnectConfigured &&
                            fcRequirement.indexOf(requirement.type) !== -1 &&
                            requirementExist &&
                            enableFranceConnect && (
                              <Flex ml="auto" width="23%" className="fcHelp">
                                <Text as="span" fontSize="11px" fontFamily="Open Sans" fontWeight={400}>
                                  {intl.formatMessage({
                                    id: 'data-collected-by-france-connect',
                                  })}
                                </Text>
                              </Flex>
                            )}
                          {requirement.disabled && requirement.type === 'IDENTIFICATION_CODE' && (
                            <InfoMessage variant="info" ml="auto">
                              <InfoMessage.Title withIcon>
                                <FormattedHTMLMessage
                                  id="identification-code-create-reminder"
                                  values={{
                                    url: '/admin-next/securedParticipation',
                                  }}
                                />
                              </InfoMessage.Title>
                            </InfoMessage>
                          )}
                        </RequirementDragItem>
                        {hasPhoneVerifiedEnabled && phoneVerifiedRequirement && (
                          <RequirementSubItem
                            isHidden={!(hasPhoneVerifiedDisplay && phoneVerifiedRequirement)}
                            isLast={phoneVerifiedRequirementIndex === requirements.length - 1}
                          >
                            <Field
                              type="checkbox"
                              id={`requirement-${phoneVerifiedRequirement.type}`}
                              disabled={phoneVerifiedRequirement.disabled || !hasFeatureTwilio}
                              component={component}
                              name={`requirements[${phoneVerifiedRequirementIndex}]`}
                              props={{
                                input: {
                                  checked: phoneVerifiedRequirement.checked,
                                  name: phoneVerifiedRequirement.type,
                                  onChange: () => {
                                    onInputCheck(
                                      !phoneVerifiedRequirement.checked,
                                      `requirements[${phoneVerifiedRequirementIndex}]`,
                                      phoneVerifiedRequirement,
                                    )
                                  },
                                },
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  color: `${requirement.disabled ? '#707070' : 'inherit'}`,
                                }}
                              >
                                {intl.formatMessage({
                                  id: phoneVerifiedRequirement?.label || '',
                                })}
                              </p>
                            </Field>
                          </RequirementSubItem>
                        )}
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </ListGroup>
  )
}

const mapDispatchToProps = (dispatch: Dispatch, props: Props) => ({
  onInputChange: (value: string, field: string, requirement: Requirement) => {
    dispatch(change(props.formName, field, { ...requirement, label: value }))
  },
  onInputCheck: (value: boolean, field: string, requirement: Requirement) => {
    let phoneRequirementValue = null
    const requirements = props.requirements.map(r => {
      // uncheck PHONE_VERIFIED when PHONE is unchecked
      if (
        r.type === 'PHONE_VERIFIED' &&
        r.checked === true &&
        phoneRequirementValue === false &&
        requirement.type !== 'PHONE_VERIFIED'
      ) {
        return { ...r, checked: false }
      }

      if (r.type === requirement.type) {
        if (r.type === 'PHONE') {
          phoneRequirementValue = value
        }

        return { ...requirement, checked: value }
      }

      return r
    })
    dispatch(change(props.formName, 'requirements', requirements))
  },
  onInputDelete: (index: number) => {
    dispatch(arrayRemove(props.formName, 'requirements', index))
  },
  dispatch,
})

export default connect(null, mapDispatchToProps)(StepRequirementsList)
