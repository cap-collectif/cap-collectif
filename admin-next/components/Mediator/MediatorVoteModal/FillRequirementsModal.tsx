import { type FC } from 'react'
import { useIntl } from 'react-intl'
import { MultiStepModal, Modal, Heading, Button, useMultiStepModal, CapUIIcon, FormLabel, Box } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { graphql, useFragment } from 'react-relay'
import { FillRequirementsModal_step$key } from '../../../__generated__/FillRequirementsModal_step.graphql'

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
                <FormControl name="lastname" control={control}>
                  <FormLabel htmlFor="lastname" label={intl.formatMessage({ id: 'global.name' })} />
                  <FieldInput id="lastname" name="lastname" control={control} type="text" minLength={2} />
                </FormControl>
              )
            }
            if (requirement.__typename === 'FirstnameRequirement') {
              return (
                <FormControl name="firstname" control={control}>
                  <FormLabel htmlFor="firstname" label={intl.formatMessage({ id: 'form.label_firstname' })} />
                  <FieldInput id="firstname" name="firstname" control={control} type="text" minLength={2} />
                </FormControl>
              )
            }
            if (requirement.__typename === 'DateOfBirthRequirement') {
              return (
                <FormControl name="dateOfBirth" control={control}>
                  <FormLabel htmlFor="dateOfBirth" label={intl.formatMessage({ id: 'form.label_date_of_birth' })} />
                  <FieldInput id="dateOfBirth" name="dateOfBirth" control={control} type="date" isOutsideRange />
                </FormControl>
              )
            }
            if (requirement.__typename === 'PostalAddressRequirement') {
              return (
                <FormControl name="address" control={control}>
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
