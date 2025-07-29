/* eslint-disable relay/unused-fields */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { Flex, Text, FormGuideline, FormLabel, Link, Uploader } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'
import { graphql } from 'react-relay'
import CsvImportResult from './CsvImportResult'
import {
  emailAvailabilitiesDefault,
  filterAvailableEmails,
  getInputFromFile,
  getInvitationsAvailability,
} from '@components/BackOffice/UserInvitation/utils'
import { CsvEmails } from '@components/BackOffice/UserInvitation/UserInvite.type'

const USER_FETCH_QUERY = graphql`
  query ImportMembersUploader_UsersAvailabilityQuery($emails: [String!]!) {
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

export const ImportMembersUploader = (): JSX.Element => {
  const intl = useIntl()

  const { setValue, watch } = useFormContext()

  const csvModelUri = 'data:text/csv;charset=utf-8,Email%20Address%20%5BRequired%5D'
  const csvModelFileName = 'users-to-group.csv'

  const [emailAvailabilities, setEmailAvailabilities] = React.useState(emailAvailabilitiesDefault)

  const inputEmails: string = watch('inputEmails')
  const csvEmails: CsvEmails = watch('csvEmails')
  const file = watch('file')

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isCorrectFormat, setIsCorrectFormat] = React.useState<boolean>(true)

  const handleCsvUpload = async (file: string | any[]) => {
    if (file?.length < 1) return
    setValue('file', file[0])
    const reader = new FileReader()
    reader.onload = async e => {
      const content = e.target.result
      const text = new TextDecoder().decode(content as ArrayBuffer)
      const result = getInputFromFile(text, setIsCorrectFormat)
      const validEmails = result.importedUsers.map(item => item.email)
      setIsLoading(true)
      const availability = await getInvitationsAvailability(inputEmails, validEmails, USER_FETCH_QUERY)
      setEmailAvailabilities(availability) // keep up-to-date for the display of result banners
      const unavailableEmails = [...availability.alreadyRegistered, ...availability.cannotBeInvited]
      const filteredEmails = filterAvailableEmails(validEmails, unavailableEmails)
      const filteredImportedUsers = result.importedUsers.filter(user => filteredEmails.includes(user.email))
      setValue('csvEmails', { ...result, importedUsers: filteredImportedUsers })
      setIsLoading(false)
    }
    reader.onabort = () => setValue('file', null)
    reader.onerror = () => setValue('file', null)
    reader.readAsArrayBuffer(file[0])
  }

  const handleCsvRemove = () => {
    setValue('file', null)
    setValue('csvEmails', { duplicateLines: [], importedUsers: [], invalidLines: [] })
    setEmailAvailabilities(emailAvailabilitiesDefault)
  }

  return (
    <Flex direction="column" spacing={4}>
      <Flex direction={'column'} width={'100%'}>
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
                  <Link href={csvModelUri} download={csvModelFileName} color="primary.base">
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
          isFullWidth
        />
      </Flex>

      {file && (
        <CsvImportResult
          csvEmails={csvEmails}
          emailAvailabilities={emailAvailabilities}
          isCorrectFormat={isCorrectFormat}
          isLoading={isLoading}
        />
      )}
    </Flex>
  )
}
export default ImportMembersUploader
