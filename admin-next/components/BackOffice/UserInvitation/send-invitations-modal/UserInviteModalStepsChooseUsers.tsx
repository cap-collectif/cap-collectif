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
  Text,
  CapUIFontSize,
  CapUILineHeight,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'
import { MAX_EMAILS } from '../utils'
import { CsvEmails } from '@components/BackOffice/UserInvitation/UserInvite.type'
import { splitEmailsFromString } from '@shared/utils/emailsInput'
import ImportMembersUploader from './ImportMembersUploader'
import { graphql } from 'react-relay'
import { getInvitationsAvailability } from '@components/BackOffice/UserInvitation/utils'
import { emailAvailabilitiesDefault } from '@components/BackOffice/UserInvitation/utils'

const USER_FETCH_QUERY = graphql`
  query UserInviteModalStepsChooseUsers_UsersAvailabilityQuery($emails: [String!]!) {
    userInvitationsAvailabilitySearch(emails: $emails) {
      totalCount
      edges {
        node {
          email
          availableForUser
          availableForInvitation
        }
      }
    }
  }
`

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

  const [inputEmailsAvailability, setInputEmailsAvailability] = React.useState(emailAvailabilitiesDefault)

  const checkInputEmailsAvailability = async () => {
    const emails = splitEmailsFromString(inputEmails).filter(isEmail)
    if (emails.length === 0) {
      setInputEmailsAvailability(emailAvailabilitiesDefault)
      return
    }
    const availability = await getInvitationsAvailability('', emails, USER_FETCH_QUERY)
    setInputEmailsAvailability(availability ?? emailAvailabilitiesDefault)
  }

  const renderInputEmailsAvailabilityMessages = () => {
    if (inputEmails === '') return null
    const alreadyRegistered = inputEmailsAvailability?.alreadyRegistered ?? []
    const alreadyRegisteredCount = alreadyRegistered.length

    return (
      <Flex direction="column">
        {alreadyRegisteredCount === 1 && (
          <Text color="neutral-gray.700" fontSize={CapUIFontSize.BodySmall} lineHeight={CapUILineHeight.Normal}>
            {intl.formatMessage({ id: 'invitations.already-used-email' }, { email: alreadyRegistered[0] })}
          </Text>
        )}
        {alreadyRegisteredCount > 1 && (
          <Text color="neutral-gray.700" fontSize={CapUIFontSize.BodySmall} lineHeight={CapUILineHeight.Normal}>
            {intl.formatMessage({ id: 'invitations.already-used-emails' })}
            {alreadyRegistered.map((email, index) => (
              <Text key={email}>
                {email}
                {index < alreadyRegisteredCount - 1 ? ', ' : ''}
              </Text>
            ))}
          </Text>
        )}
      </Flex>
    )
  }

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
          <Flex direction="column" spacing={1}>
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
                onBlur={() => {
                  validateInputEmailsFormat()
                  checkInputEmailsAvailability()
                }}
              />
            </FormControl>
            {renderInputEmailsAvailabilityMessages()}
          </Flex>

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
