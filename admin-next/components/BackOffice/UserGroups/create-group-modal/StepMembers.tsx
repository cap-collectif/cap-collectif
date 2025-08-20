import * as React from 'react'
import {
  Button,
  Divider,
  Flex,
  FormGuideline,
  FormLabel,
  Heading,
  MultiStepModal,
  toast,
  useMultiStepModal,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { FieldInput, FormControl } from '@cap-collectif/form'
import CreateGroupMutation from '@mutations/CreateGroupMutation'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { CreateGroupFormProps, CsvEmails } from '../UserGroups.type'
import { MAX_EMAILS } from '../utils'
import { isEmail } from '@shared/utils/validators'
import { useFormContext } from 'react-hook-form'
import ImportMembersUploader from '../csv-import/ImportMembersUploader'
import { splitEmailsFromString } from '@shared/utils/emailsInput'

type Props = {
  connectionId: string
}

export const StepMembers: React.FC<Props> = ({ connectionId }) => {
  const intl = useIntl()
  const { goToPreviousStep, hide } = useMultiStepModal()

  const methods = useFormContext()
  const { clearErrors, control, handleSubmit, reset, setError, watch } = methods

  const {
    formState: { errors, isSubmitting },
  } = methods

  const inputEmails: string = watch('inputEmails')
  const csvEmails: CsvEmails = watch('csvEmails')

  const inputEmailsError = errors['inputEmails']

  const validateInputEmailsFormat = () => {
    clearErrors('inputEmails')

    if (inputEmails === '') {
      return
    }

    const emails = splitEmailsFromString(inputEmails)
    const formattedWrongInputEmails = emails.filter(email => !isEmail(email)) || []

    if (formattedWrongInputEmails?.length > 0) {
      setError('inputEmails', {
        type: 'manual',
        message: intl.formatMessage({ id: 'input-emails-wrong-format' }),
      })
      return
    }
    if (emails.length > MAX_EMAILS) {
      setError('inputEmails', {
        type: 'manual',
        message: intl.formatMessage({ id: 'input-emails-max-reached' }),
      })
      return
    }
  }

  const onSubmit = async (data: CreateGroupFormProps) => {
    const validInputEmails = splitEmailsFromString(inputEmails).filter(isEmail) || []
    const validCsvEmails = csvEmails?.uniqueAndValid?.map(user => user.email).filter(isEmail) || []

    validateInputEmailsFormat()

    if (inputEmailsError) return

    if (validInputEmails.length === 0 && validCsvEmails.length === 0) {
      setError('inputEmails', {
        type: 'manual',
        message: intl.formatMessage({ id: 'invitation.add-minimum-one-email' }),
      })
      return
    }

    // emails from both csvEmails and inputEmails
    const allEmails = [...validCsvEmails, ...validInputEmails]

    const createGroupInput = {
      input: {
        title: data.groupName,
        description: data.description ?? null,
        emails: allEmails,
        dryRun: false,
      },
      connections: [connectionId],
    }

    try {
      await CreateGroupMutation.commit(createGroupInput)

      toast({
        variant: 'success',
        content: intl.formatMessage({ id: 'admin.group-create-success' }, { groupName: data.groupName }),
      })
      hide()
      reset()
    } catch (err) {
      mutationErrorToast(intl)
    }
  }

  return (
    <>
      <MultiStepModal.Header id={'select-members-modal-step'}>
        <MultiStepModal.Header.Label closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
          {intl.formatMessage({ id: 'users.create-group' })}
        </MultiStepModal.Header.Label>
        <Heading>{intl.formatMessage({ id: 'group-admin-add-members' })}</Heading>
      </MultiStepModal.Header>

      <MultiStepModal.Body>
        <Flex direction="column" spacing={2}>
          <FormControl name="inputEmails" key="inputEmails" control={control}>
            <FormLabel
              htmlFor="inputEmails"
              label={intl.formatMessage({
                id: 'global.select-users',
              })}
            />
            <FormGuideline>{intl.formatMessage({ id: 'enter-email-address' })}</FormGuideline>
            <FieldInput
              control={control}
              type="text"
              id="inputEmails"
              name="inputEmails"
              onBlur={validateInputEmailsFormat}
            />
          </FormControl>

          <Divider>{intl.formatMessage({ id: 'global.or' }).toUpperCase()}</Divider>

          <ImportMembersUploader />
        </Flex>
      </MultiStepModal.Body>

      <MultiStepModal.Footer>
        <Button variant="secondary" variantColor="primary" variantSize="big" onClick={goToPreviousStep}>
          {intl.formatMessage({
            id: 'global.back',
          })}
        </Button>
        <Button
          variant="primary"
          variantColor="primary"
          variantSize="big"
          onClick={() => handleSubmit(data => onSubmit(data as CreateGroupFormProps))()}
          isLoading={isSubmitting}
        >
          {intl.formatMessage({
            id: 'users.group-create',
          })}
        </Button>
      </MultiStepModal.Footer>
    </>
  )
}

export default StepMembers
