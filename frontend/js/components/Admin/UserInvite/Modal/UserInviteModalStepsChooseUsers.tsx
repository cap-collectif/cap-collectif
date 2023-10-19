import * as React from 'react'
import { useState } from 'react'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import type { DropzoneFile } from 'react-dropzone'
import { change, Field, getFormAsyncErrors } from 'redux-form'
import { useSelector } from 'react-redux'
import Flex from '~ui/Primitives/Layout/Flex'
import { CsvDropZoneInput } from '~/components/Utils/CsvDropZoneInput'
import { csvToArray } from '~/utils/csvToArray'
import { isEmail } from '~/services/Validator'
import type { Dispatch, GlobalState } from '~/types'
import component from '~/components/Form/Field'
import type { Step } from '~/components/DesignSystem/ModalSteps/ModalSteps.context'
import '~/components/DesignSystem/ModalSteps/ModalSteps.context'
import InlineList from '~ds/InlineList/InlineList'
import Text from '~ui/Primitives/Text'
import { FontWeight } from '~ui/Primitives/constants'
type EmailInput = {
  duplicateLines: number[]
  importedUsers: string[]
  invalidLines: number[]
}

const getInputFromFile = (content: string): EmailInput => {
  const contentArray = csvToArray(content)
  const rows = [...new Set(contentArray)].filter(Boolean)
  const mails = rows.filter(isEmail)
  const invalidLines = rows
    .filter(mail => !isEmail(mail))
    .map((mail: string) => {
      return rows.indexOf(mail)
    })
  const duplicateLines = mails.reduce((acc, el, i, arr) => {
    if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(i)
    return acc
  }, [])
  return {
    duplicateLines,
    importedUsers: mails,
    invalidLines,
  }
}

const renderUsedEmails = (usedEmails: String[], intl: IntlShape) => {
  if (usedEmails.length > 0) {
    if (usedEmails.length === 1) {
      return (
        <Flex direction="row">
          <Text color="gray.400">
            {intl.formatMessage(
              {
                id: 'invitations.already-used-email',
              },
              {
                email: usedEmails[0],
              },
            )}
          </Text>
        </Flex>
      )
    }

    return (
      <Flex direction="column">
        <Text color="gray.400">
          {intl.formatMessage({
            id: 'invitations.already-used-emails',
          })}{' '}
          &nbsp;
        </Text>
        <InlineList color="gray.400" separator=",">
          {usedEmails.map(email => (
            <Text>{email}</Text>
          ))}
        </InlineList>
      </Flex>
    )
  }

  return null
}

type Props = Step & {
  readonly dispatch: Dispatch
}
export const UserInviteModalStepsChooseUsers = ({ dispatch }: Props): JSX.Element => {
  const intl = useIntl()
  const [file, setFile] = useState<DropzoneFile | null | undefined>(null)
  const asyncErrorsData = useSelector((state: GlobalState) => getFormAsyncErrors('form-user-invitation')(state)) ?? null
  const usedEmails =
    asyncErrorsData !== null && asyncErrorsData?._inputEmails && asyncErrorsData?._inputEmails?.data
      ? asyncErrorsData._inputEmails.data
      : []
  return (
    <Flex direction="column" spacing={4}>
      <Field
        label={
          <Text fontWeight={FontWeight.Semibold}>
            {intl.formatMessage({
              id: 'entering-email-addresses',
            })}
          </Text>
        }
        id="inputEmails"
        type="text"
        name="inputEmails"
        placeholder="enter-email-address"
        component={component}
      />
      {renderUsedEmails(usedEmails, intl)}
      <Text fontWeight={FontWeight.Semibold}>
        {intl.formatMessage({
          id: 'import-csv-file',
        })}
      </Text>
      <Field
        name="csvEmails"
        component={CsvDropZoneInput}
        meta={{
          asyncValidating: false,
        }}
        onPostDrop={files => {
          if (files.length > 0) {
            const reader = new window.FileReader()

            reader.onload = () => {
              dispatch(change('form-user-invitation', 'csvEmails', getInputFromFile(reader.result)))
            }

            reader.onabort = () => setFile(null)

            reader.onerror = () => setFile(null)

            reader.readAsText(files[0])
            setFile(files[0])
          }
        }}
        disabled={false}
        currentFile={file}
      />
    </Flex>
  )
}
export default UserInviteModalStepsChooseUsers
