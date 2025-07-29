import * as React from 'react'
import { Flex, FormGuideline, FormLabel, Link, Text, Uploader } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import CsvImportResult from './CsvImportResult'
import { csvEmailsDefaultValue, getInputFromFile } from '../utils'
import { useFormContext } from 'react-hook-form'
import CreateGroupMutation from '@mutations/CreateGroupMutation'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'

type ImportMembersUploaderProps = {
  existingGroupName?: string // If the import is from the edit group modal, we need to get the groupName for the dry run mutation that checks availability
}

export const ImportMembersUploader = ({ existingGroupName }: ImportMembersUploaderProps): JSX.Element => {
  const intl = useIntl()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isCorrectFormat, setIsCorrectFormat] = React.useState<boolean | null>(null)

  const csvModelUri = 'data:text/csv;charset=utf-8,Email%20Address%20%5BRequired%5D'
  const csvModelFileName = 'users-to-group.csv'

  const methods = useFormContext()
  const { watch, setValue } = methods

  const file = watch('file')
  const csvEmails = watch('csvEmails')
  const groupName = watch('groupName') // If the import is from the create group modal
  const description = watch('description')

  const handleDryRun = async (emails: string[]) => {
    try {
      const result = await CreateGroupMutation.commit({
        input: {
          title: groupName || existingGroupName,
          description: description ?? null,
          emails,
          dryRun: true,
        },
        connections: [],
      })

      const dryRunResult = result.createGroup

      return {
        uniqueAndValid: dryRunResult.importedUsers,
        duplicates: dryRunResult.alreadyImportedUsers,
        notFoundEmails: dryRunResult.notFoundEmails,
      }
    } catch (err) {
      mutationErrorToast(intl)
    }
  }

  const handleCsvUpload = async (file: string | any[]) => {
    if (file?.length > 0) {
      setValue('file', file[0])
      const reader = new FileReader()
      reader.onload = async e => {
        const content = e.target.result
        const text = new TextDecoder().decode(content as ArrayBuffer)
        const result = getInputFromFile(text, setIsCorrectFormat)

        let finalResult = { ...result }

        if (result?.uniqueAndValid?.length > 0) {
          const dryRunResponse = await handleDryRun(result.uniqueAndValid.map(user => user.email))

          if (dryRunResponse) {
            finalResult = {
              ...finalResult,
              uniqueAndValid: dryRunResponse.uniqueAndValid.map(user => ({
                email: user.email,
                line: result.uniqueAndValid.find(u => u.email === user.email)?.line || '',
              })),
              invalid: result.invalid,
              notFoundEmails: dryRunResponse.notFoundEmails.map(email => email) || [],
            }
          }
        }

        setValue('csvEmails', finalResult)
        setIsLoading(false)
      }
      reader.onabort = () => setValue('file', null)
      reader.onerror = () => setValue('file', null)
      reader.readAsArrayBuffer(file[0])
    }
  }

  const handleCsvRemove = async () => {
    setValue('file', null)
    setValue('csvEmails', csvEmailsDefaultValue)
    setIsCorrectFormat(null)
    return
  }

  return (
    <Flex direction={'column'} gap={4}>
      <Flex direction={'column'} width={'100%'} gap={1}>
        <FormLabel
          htmlFor="file"
          label={intl.formatMessage({
            id: 'modal-add-members-via-file',
          })}
        />
        <FormGuideline>
          <Text lineHeight={'auto'}>{intl.formatMessage({ id: 'admin.users.users-to-group' })} </Text>
          &nbsp;
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
            setIsLoading(true)
            handleCsvUpload(file)
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

      {file && <CsvImportResult csvEmails={csvEmails} isCorrectFormat={isCorrectFormat} isLoading={isLoading} />}
    </Flex>
  )
}

export default ImportMembersUploader
