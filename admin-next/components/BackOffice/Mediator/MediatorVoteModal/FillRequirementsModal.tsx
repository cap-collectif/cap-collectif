import { FieldInput, FormControl } from '@cap-collectif/form'
import {
  Box,
  Button,
  CapInputSize,
  CapUIIcon,
  FormLabel,
  Heading,
  Modal,
  MultiStepModal,
  useMultiStepModal,
} from '@cap-collectif/ui'
import { FillRequirementsModal_step$key } from '@relay/FillRequirementsModal_step.graphql'
import React, { type FC } from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'

type FillRequirementsModalProps = {
  step: FillRequirementsModal_step$key
  isNew: boolean
}

const STEP_FRAGMENT = graphql`
  fragment FillRequirementsModal_step on RequirementStep {
    requirements {
      edges {
        node {
          id
          ... on FirstnameRequirement {
            __typename
          }
          ... on LastnameRequirement {
            __typename
          }
          ... on DateOfBirthRequirement {
            __typename
          }
          ... on PostalAddressRequirement {
            __typename
          }
          ... on ZipCodeRequirement {
            __typename
          }
          ... on CheckboxRequirement {
            id
            __typename
            label
          }
        }
      }
    }
  }
`

const ONLY_NUMBER_REGEX = /^(0|[1-9]\d*)(\.\d+)?$/
const ZIP_CODE_LENGTH = 5

type RequirementType = 'CheckboxRequirement' | 'LastnameRequirement'

const FillRequirementsModal: FC<FillRequirementsModalProps> = ({ step: stepRef, isNew }) => {
  const intl = useIntl()
  const step = useFragment(STEP_FRAGMENT, stepRef)

  const requirements = step.requirements.edges.map(edge => edge.node)
  const toggleRequirements = requirements.filter(
    requirement => (requirement.__typename as RequirementType) !== 'CheckboxRequirement',
  )

  const checkboxRequirements = requirements.filter(
    requirement => (requirement.__typename as RequirementType) === 'CheckboxRequirement',
  )

  const { control, setValue } = useFormContext()

  const { goToNextStep, goToPreviousStep } = useMultiStepModal()
  const id = React.useId()

  return (
    <>
      <MultiStepModal.Header>
        {isNew ? (
          <Modal.Header.Label>{intl.formatMessage({ id: 'mediator.new_participant' })}</Modal.Header.Label>
        ) : null}
        <Heading>{intl.formatMessage({ id: 'mediator.required_informations' })}</Heading>
      </MultiStepModal.Header>
      <Modal.Body>
        <Box width="50%">
          {toggleRequirements.map(requirement => {
            if ((requirement.__typename as RequirementType) === 'LastnameRequirement') {
              return (
                <FormControl name="lastname" control={control} key={id}>
                  <FormLabel htmlFor="lastname" label={intl.formatMessage({ id: 'global.name' })} />
                  <FieldInput id="lastname" name="lastname" control={control} type="text" minLength={2} />
                </FormControl>
              )
            }
            if (requirement.__typename === 'FirstnameRequirement') {
              return (
                <FormControl name="firstname" control={control} key={id}>
                  <FormLabel htmlFor="firstname" label={intl.formatMessage({ id: 'form.label_firstname' })} />
                  <FieldInput id="firstname" name="firstname" control={control} type="text" minLength={2} />
                </FormControl>
              )
            }
            if (requirement.__typename === 'DateOfBirthRequirement') {
              return (
                <FormControl name="dateOfBirth" control={control} key={id}>
                  <FormLabel htmlFor="dateOfBirth" label={intl.formatMessage({ id: 'form.label_date_of_birth' })} />
                  <FieldInput id="dateOfBirth" name="dateOfBirth" control={control} type="date" />
                </FormControl>
              )
            }
            if (requirement.__typename === 'PostalAddressRequirement') {
              return (
                <FormControl name="address" control={control} key={id}>
                  <FormLabel htmlFor="address" label={intl.formatMessage({ id: 'admin.fields.event.address' })} />
                  <FieldInput
                    id="address"
                    name="address"
                    control={control}
                    type="address"
                    getAddress={add => {
                      setValue('JSONaddress', add)
                    }}
                  />
                </FormControl>
              )
            }
            if (requirement.__typename === 'ZipCodeRequirement') {
              return (
                <FormControl name="zipCode" control={control} key={id}>
                  <FormLabel htmlFor="zipCode" label={intl.formatMessage({ id: 'admin.fields.event.address' })} />
                  <FieldInput
                    id="zipCode"
                    name="zipCode"
                    control={control}
                    type="text"
                    variantSize={CapInputSize.Md}
                    placeholder="75100"
                    maxLength={5}
                    rules={{
                      pattern: {
                        value: ONLY_NUMBER_REGEX,
                        message: intl.formatMessage({
                          id: 'field-must-contains-number',
                        }),
                      },
                      validate: {
                        exact: v =>
                          v.length === ZIP_CODE_LENGTH ||
                          intl.formatMessage({ id: 'characters-required' }, { length: ZIP_CODE_LENGTH }),
                      },
                    }}
                  />
                </FormControl>
              )
            }
            return null
          })}
          {checkboxRequirements.map(requirement => {
            return (
              <FormControl name={`checkbox.${requirement.id}`} control={control} key={requirement.id}>
                <FieldInput
                  id={`checkboxes.${requirement.id}`}
                  name={`checkboxes.${requirement.id}`}
                  control={control}
                  type="checkbox"
                >
                  {requirement.label}
                </FieldInput>
              </FormControl>
            )
          })}
        </Box>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" variantColor="primary" variantSize="big" onClick={goToPreviousStep}>
          {intl.formatMessage({ id: 'global.back' })}
        </Button>
        <Button
          variant="primary"
          variantColor="primary"
          variantSize="big"
          onClick={goToNextStep}
          rightIcon={CapUIIcon.LongArrowRight}
        >
          {intl.formatMessage({ id: 'global.next' })}
        </Button>
      </Modal.Footer>
    </>
  )
}

export default FillRequirementsModal
