import { type FC } from 'react'
import { useIntl } from 'react-intl'
import { MultiStepModal, Modal, Heading, Button, useMultiStepModal, CapUIIcon, FormLabel, Box } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { RequirementTypeName } from '@components/Requirements/Requirements'

type FillRequirementsModalProps = {
  requirements: RequirementTypeName[]
  isNew: boolean
}

const FillRequirementsModal: FC<FillRequirementsModalProps> = ({ requirements, isNew }) => {
  const intl = useIntl()
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
          {requirements.includes('LastnameRequirement') ? (
            <FormControl name="lastname" control={control}>
              <FormLabel htmlFor="lastname" label={intl.formatMessage({ id: 'global.name' })} />
              <FieldInput id="lastname" name="lastname" control={control} type="text" minLength={2} />
            </FormControl>
          ) : null}
          {requirements.includes('FirstnameRequirement') ? (
            <FormControl name="firstname" control={control}>
              <FormLabel htmlFor="firstname" label={intl.formatMessage({ id: 'form.label_firstname' })} />
              <FieldInput id="firstname" name="firstname" control={control} type="text" minLength={2} />
            </FormControl>
          ) : null}
          {requirements.includes('DateOfBirthRequirement') ? (
            <FormControl name="dateOfBirth" control={control}>
              <FormLabel htmlFor="dateOfBirth" label={intl.formatMessage({ id: 'form.label_date_of_birth' })} />
              <FieldInput id="dateOfBirth" name="dateOfBirth" control={control} type="date" isOutsideRange />
            </FormControl>
          ) : null}
          {requirements.includes('PostalAddressRequirement') ? (
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
          ) : null}
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
