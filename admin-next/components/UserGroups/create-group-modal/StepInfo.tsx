import * as React from 'react'
import { Button, CapUIIcon, Flex, FormLabel, Heading, MultiStepModal, Text, useMultiStepModal } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'

export const StepInfo = (): JSX.Element => {
  const intl = useIntl()
  const { goToNextStep, hide } = useMultiStepModal()
  const methods = useFormContext()
  const { control, reset, setError, watch } = methods

  const groupName = watch('groupName')

  const handleClickOnNext = (): void => {
    groupName && groupName !== ''
      ? goToNextStep()
      : setError('groupName', {
          type: 'manual',
          message: intl.formatMessage({ id: 'global.form.mandatory' }),
        })
  }

  return (
    <Flex direction={'column'}>
      <MultiStepModal.Header id={'create-group-modal'}>
        <MultiStepModal.Header.Label closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
          {intl.formatMessage({ id: 'users.create-group' })}
        </MultiStepModal.Header.Label>
        <Heading>{intl.formatMessage({ id: 'information' })}</Heading>
      </MultiStepModal.Header>

      <MultiStepModal.Body>
        <Flex direction="column" spacing={2}>
          <FormControl name="groupName" control={control} isRequired>
            <FormLabel htmlFor="groupName" label={intl.formatMessage({ id: 'admin.users.group-name' })} />
            <FieldInput name="groupName" control={control} type="text" />
          </FormControl>

          <FormControl name="description" control={control}>
            <FormLabel htmlFor="description" label={intl.formatMessage({ id: 'global.description' })}>
              <Text color="gray.500">{intl.formatMessage({ id: 'global.optional' })}</Text>
            </FormLabel>
            <FieldInput type="textarea" control={control} name="description" />
          </FormControl>
        </Flex>
      </MultiStepModal.Body>

      <MultiStepModal.Footer>
        <Button
          variant="secondary"
          variantColor="primary"
          variantSize="big"
          onClick={() => {
            reset()
            hide()
          }}
        >
          {intl.formatMessage({
            id: 'global.cancel',
          })}
        </Button>

        <Button
          variant="primary"
          variantColor="primary"
          variantSize="big"
          onClick={handleClickOnNext}
          rightIcon={CapUIIcon.LongArrowRight}
        >
          {intl.formatMessage({
            id: 'global.next',
          })}
        </Button>
      </MultiStepModal.Footer>
    </Flex>
  )
}

export default StepInfo
