import * as React from 'react'
import { useIntl } from 'react-intl'
import { isEmail } from '@shared/utils/validators'
import {
  Button,
  CapUIIcon,
  Flex,
  FormGuideline,
  FormLabel,
  Heading,
  MultiStepModal,
  useMultiStepModal,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'
import { MAX_EMAILS } from '../utils'
import { CsvEmails } from '@components/UserInvitation/UserInvite.type'
import { splitEmailsFromString } from '@shared/utils/emailsInput'
import ImportMembersUploader from './ImportMembersUploader'

type Props = {
  id: string
  label: string
  validationLabel: string
}

export const UserInviteModalStepsChooseUsers = ({ id, label }: Props): JSX.Element => {
  const intl = useIntl()

  const { goToNextStep, hide } = useMultiStepModal()

  const {
    reset,
    control,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useFormContext()

  const inputEmails: string = watch('inputEmails')
  const csvEmails: CsvEmails = watch('csvEmails')

  const validateInputEmailsFormat = () => {
    if (inputEmails === '') {
      clearErrors('inputEmails')
      return
    }

    const emails = splitEmailsFromString(inputEmails)
    const formattedWrongInputEmails = emails.filter(email => !isEmail(email))

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
    clearErrors('inputEmails')
    return
  }

  const handleClickOnNext = () => {
    clearErrors(['inputEmails', 'csvEmails'])

    const validInputEmails = splitEmailsFromString(inputEmails).filter(isEmail)
    const validCsvEmails = csvEmails?.importedUsers?.map(user => user.email).filter(isEmail) || []
    validateInputEmailsFormat()
    if (errors['inputEmails']) {
      return
    }

    if (validInputEmails.length === 0 && validCsvEmails.length === 0) {
      setError('inputEmails', {
        type: 'manual',
        message: intl.formatMessage({ id: 'invitation.add-minimum-one-email' }),
      })
      return
    }

    if (!errors['inputEmails'] && !errors['csvEmails']) {
      goToNextStep()
    }
  }

  return (
    <>
      <MultiStepModal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })} id={id}>
        <MultiStepModal.Header.Label closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
          {intl.formatMessage({ id: 'user-invite-admin-page-title' })}
        </MultiStepModal.Header.Label>
        <Heading>{intl.formatMessage({ id: label })}</Heading>
      </MultiStepModal.Header>

      <MultiStepModal.Body>
        <Flex direction="column" spacing={4}>
          <FormControl name="inputEmails" key="inputEmails" control={control}>
            <FormLabel
              htmlFor="inputEmails"
              label={intl.formatMessage({
                id: 'entering-email-addresses',
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

          <ImportMembersUploader />
        </Flex>
      </MultiStepModal.Body>

      <MultiStepModal.Footer>
        <Button
          variant="secondary"
          variantColor="hierarchy"
          variantSize="big"
          onClick={() => {
            hide()
            reset()
          }}
        >
          {intl.formatMessage({
            id: 'global.cancel',
          })}
        </Button>
        <Button
          variant="secondary"
          variantColor="primary"
          variantSize="big"
          onClick={handleClickOnNext}
          rightIcon={CapUIIcon.LongArrowRight}
        >
          {intl.formatMessage({
            id: 'setup-invitation',
          })}
        </Button>
      </MultiStepModal.Footer>
    </>
  )
}
export default UserInviteModalStepsChooseUsers
