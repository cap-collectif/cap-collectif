import { $PropertyType } from 'utility-types'
import React from 'react'
import type { DropzoneFile } from 'react-dropzone'
import type { FieldProps } from 'redux-form'
import { updateSyncErrors } from 'redux-form'
import { useDispatch } from 'react-redux'
import { FormGroup } from 'react-bootstrap'
import { FormattedHTMLMessage, useIntl } from 'react-intl'
import FileUpload from '../Form/FileUpload'
import Fetcher, { json } from '~/services/Fetcher'
import Card from '~ds/Card/Card'
import { InfoMessage } from '@cap-collectif/ui'

type FileUploadFieldProps = {
  input: {
    value: $PropertyType<$PropertyType<FieldProps, 'input'>, 'value'>
    name: $PropertyType<$PropertyType<FieldProps, 'input'>, 'name'>
  }
  onPostDrop: (
    media: {
      id: string
      name: string
      url: string
    },
    input: Record<string, any>,
  ) => void
  disabled: boolean
  currentFile:
    | {
        id: string
        name: string
        url: string
      }
    | null
    | undefined
}
const CSV_MAX_UPLOAD_SIZE = 8000000

export const formName = `ImportProposalsFromCsvModal`

export const ProposalCsvDropZoneInput = ({ input, onPostDrop, disabled }: FileUploadFieldProps) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  return (
    <FormGroup>
      <FileUpload
        name={input.name}
        accept="text/csv"
        maxSize={CSV_MAX_UPLOAD_SIZE}
        inputProps={{
          id: 'csv-file_field',
        }}
        minSize={1}
        disabled={disabled}
        onDrop={(files: Array<DropzoneFile>) => {
          dispatch(
            updateSyncErrors(
              formName,
              {
                csvProposals: '',
              },
              'LOADING',
            ),
          )

          for (const file of files) {
            const formData = new FormData()
            formData.append('file', file)
            Fetcher.postFormData('/files', formData)
              .then(json)
              .then(res => {
                const newFile = {
                  id: res.id,
                  name: res.name,
                  url: res.url,
                }
                onPostDrop(newFile, input)
              })
          }
        }}
      />
      {input.value.importableProposals && (
        <Card paddingTop={2} paddingBottom={0} paddingX={0} width="100%" border="none">
          <InfoMessage
            variant="success"
            style={{
              wordWrap: 'anywhere',
            }}
          >
            <InfoMessage.Title withIcon>
              {intl.formatMessage(
                {
                  id: 'proposal-ready-to-import',
                },
                {
                  num: input.value.importableProposals.num,
                },
              )}
            </InfoMessage.Title>
          </InfoMessage>
        </Card>
      )}
      {input.value.errorCode && (
        <Card paddingTop={2} paddingBottom={0} paddingX={0} width="100%" border="none">
          <InfoMessage
            variant="danger"
            style={{
              wordWrap: 'anywhere',
            }}
          >
            <InfoMessage.Title withIcon>
              {input.value.errorCode === 'verification-failed' && input.value.verificationFailed ? (
                input?.value?.verificationFailed()
              ) : (
                <FormattedHTMLMessage
                  id={
                    input.value.errorCode === 'EMPTY_FILE'
                      ? '0-proposals-identified'
                      : input.value.errorCode === 'BAD_DATA_MODEL'
                      ? 'invalid-data-model'
                      : input.value.errorCode === 'TOO_MUCH_LINES'
                      ? 'error-import-max-proposals'
                      : input.value.errorCode === 'VIEWER_NOT_ALLOWED'
                      ? 'error-import-viewer-not-allowed'
                      : input.value.errorCode
                  }
                />
              )}
            </InfoMessage.Title>
          </InfoMessage>
        </Card>
      )}
      {input.value.badLines && (
        <Card paddingTop={2} paddingBottom={0} paddingX={0} width="100%" border="none">
          <InfoMessage
            variant="danger"
            style={{
              wordWrap: 'anywhere',
            }}
          >
            <InfoMessage.Title withIcon>
              <FormattedHTMLMessage
                id="csv-bad-lines-error"
                values={{
                  count: input.value.badLines.num,
                  lines: input.value.badLines.lines,
                  last: input.value.badLines.last,
                }}
              />
            </InfoMessage.Title>
          </InfoMessage>
        </Card>
      )}
      {input.value.mandatoryMissing && (
        <Card paddingTop={2} paddingBottom={0} paddingX={0} width="100%" border="none">
          <InfoMessage
            variant="danger"
            style={{
              wordWrap: 'anywhere',
            }}
          >
            <InfoMessage.Title withIcon>
              {intl.formatMessage(
                {
                  id: 'import-proposals-mandatory-error',
                },
                {
                  num: input.value.mandatoryMissing.num,
                  lines: input.value.mandatoryMissing.lines,
                  last: input.value.mandatoryMissing.last,
                },
              )}
            </InfoMessage.Title>
          </InfoMessage>
        </Card>
      )}
      {input.value.duplicates && (
        <Card paddingTop={2} paddingBottom={0} paddingX={0} width="100%" border="none">
          <InfoMessage
            variant="warning"
            style={{
              wordWrap: 'anywhere',
            }}
          >
            <InfoMessage.Title withIcon>
              {intl.formatMessage(
                {
                  id: 'row-import-duplicates-error',
                },
                {
                  num: input.value.duplicates.num,
                  lines: input.value.duplicates.lines,
                  last: input.value.duplicates.last,
                },
              )}
            </InfoMessage.Title>
          </InfoMessage>
        </Card>
      )}
    </FormGroup>
  )
}
