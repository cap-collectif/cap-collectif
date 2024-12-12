/* eslint-disable relay/unused-fields */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { isEmail } from '../../../../frontend/js/services/Validator'
import {
  Button,
  CapUIIcon,
  Flex,
  Text,
  FormGuideline,
  FormLabel,
  Heading,
  MultiStepModal,
  useMultiStepModal,
  Link,
  Uploader,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'
import { graphql } from 'react-relay'
import CsvImportResultBanners from './CsvImportResultBanners'
import {
  emailAvailabilitiesDefault,
  getInputFromFile,
  getInvitationsAvailability,
  maxEmails,
  splitEmailsFromString,
} from '@components/UserInvitation/utils'
import { CsvEmails } from '@components/UserInvitation/UserInvite.type'

type Props = {
  id: string
  label: string
  validationLabel: string
}

const USER_FETCH_QUERY = graphql`
  query UserInviteModalStepsChooseUsersQuery($emails: [String!]!) {
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

export const UserInviteModalStepsChooseUsers = ({ id, label }: Props): JSX.Element => {
  const intl = useIntl()

  const { goToNextStep, hide } = useMultiStepModal()

  const {
    reset,
    control,
    setError,
    clearErrors,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()

  const csvModelUri = 'data:text/csv;charset=utf-8,Email%20Address%20%5BRequired%5D'
  const csvModelFileName = 'users-to-group.csv'

  const [emailAvailabilities, setEmailAvailabilities] = React.useState(emailAvailabilitiesDefault)

  const inputEmails: string = watch('inputEmails')
  const csvEmails: CsvEmails = watch('csvEmails')
  const file = watch('file')

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [csvIsWrongFormat, setCsvIsWrongFormat] = React.useState<boolean>(false)

  const filterUnavailableEmails = (emails: CsvEmails) => {
    const { emailsAlreadyLinkedToAnAccount, emailsAlreadyReceivedInvitation } =
      emailAvailabilities ?? emailAvailabilitiesDefault
    const unavailableEmails = [...emailsAlreadyLinkedToAnAccount, ...emailsAlreadyReceivedInvitation]
    const filteredEmails = emails.importedUsers?.filter(item => !unavailableEmails.includes(item.email))
    return {
      ...emails,
      importedUsers: filteredEmails,
    }
  }

  const handleCsvUpload = async (file: string | any[]) => {
    if (file?.length > 0) {
      setValue('file', file[0])
      const reader = new FileReader()
      reader.onload = async e => {
        const content = e.target.result
        const text = new TextDecoder().decode(content as ArrayBuffer)
        const result = getInputFromFile(text, setCsvIsWrongFormat)
        const validEmails = result.importedUsers.map(item => item.email)
        setIsLoading(true)

        const availability = await getInvitationsAvailability(inputEmails, validEmails, USER_FETCH_QUERY)
        setEmailAvailabilities(availability)
        setValue('csvEmails', filterUnavailableEmails(result))
        setIsLoading(false)
      }
      reader.onabort = () => setValue('file', null)
      reader.onerror = () => setValue('file', null)
      reader.readAsArrayBuffer(file[0])
    }
  }

  const handleCsvRemove = () => {
    setValue('file', null)
    setValue('csvEmails', { duplicateLines: [], importedUsers: [], invalidLines: [] })
    setEmailAvailabilities(emailAvailabilitiesDefault)
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
    if (emails.length > maxEmails) {
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

          <Flex
            direction={'column'}
            width={'100%'}
            sx={{
              '.cap-uploader': { width: '100%', minWidth: 'unset' },
              '.cap-uploader > div ': { width: '100%' },
            }}
          >
            <FormLabel
              htmlFor="file"
              label={intl.formatMessage({
                id: 'import-csv-file',
              })}
            />
            <FormGuideline>
              <Text>
                {intl.formatMessage(
                  { id: 'organization.invitation.download-csv-model' },
                  {
                    // eslint-disable-next-line react/display-name
                    a: (...chunks) => (
                      <Link href={csvModelUri} download={csvModelFileName} color="primary.600">
                        {chunks}
                      </Link>
                    ),
                  },
                )}
              </Text>
            </FormGuideline>
            <Uploader
              type="uploader"
              name="file"
              id="file"
              format=".csv"
              maxFiles={1}
              value={file}
              onDrop={async file => {
                await handleCsvUpload(file)
              }}
              onRemove={handleCsvRemove}
              wording={{
                uploaderPrompt: intl.formatMessage({ id: 'uploader-prompt' }, { count: 1, fileType: 'csv' }),
                uploaderLoadingPrompt: intl.formatMessage({ id: 'page-media-add--loading' }),
                fileDeleteLabel: intl.formatMessage({ id: 'admin.global.delete' }),
              }}
              showThumbnail
            />
          </Flex>

          {file && (
            <CsvImportResultBanners
              csvEmails={csvEmails}
              emailAvailabilities={emailAvailabilities}
              csvIsWrongFormat={csvIsWrongFormat}
              isLoading={isLoading}
            />
          )}
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
