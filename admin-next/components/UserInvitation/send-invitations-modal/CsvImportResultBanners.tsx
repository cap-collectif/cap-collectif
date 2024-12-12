import * as React from 'react'
import { CapUIIconSize, Flex, InfoMessage, Link, Spinner } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { CsvEmails, EmailAvailabilities } from '@components/UserInvitation/UserInvite.type'
import { filterAvailableEmails, getLineNumbers, getListAsString } from '@components/UserInvitation/utils'

type Props = {
  csvEmails: CsvEmails
  emailAvailabilities: EmailAvailabilities
  csvIsWrongFormat: boolean
  isLoading: boolean
}

type BannerProps = {
  title?: string | React.ReactNode
  content?: string | React.ReactNode
  variant: 'danger' | 'warning' | 'success'
}

export const CsvImportResultBanners = ({ csvEmails, emailAvailabilities, csvIsWrongFormat, isLoading }: Props) => {
  const intl = useIntl()

  const { duplicateLines, importedUsers, invalidLines } = csvEmails || {}

  // an email that's already used in an account cannot be invited again
  // it must be ignored in the count for identified emails
  const emailsAlreadyLinkedToAnAccount = emailAvailabilities?.emailsAlreadyLinkedToAnAccount ?? []
  // relaunching invitations can only be done via the quick action button in the invitations list component
  const emailsAlreadyReceivedInvitation = emailAvailabilities?.emailsAlreadyReceivedInvitation ?? []

  const unavailableEmails = [...emailsAlreadyLinkedToAnAccount, ...emailsAlreadyReceivedInvitation]

  const importedUsersEmails = importedUsers?.map(user => user.email) || []
  const invitableEmails = filterAvailableEmails(importedUsersEmails, unavailableEmails)

  const invalidEmailsLineNumbers = getLineNumbers(invalidLines)
  const duplicateEmailsLineNumbers = getLineNumbers(duplicateLines)

  const helpLink = 'https://aide.cap-collectif.com/article/254-importer-des-propositions'

  if (!csvEmails && !emailAvailabilities) {
    return null
  }

  if (csvIsWrongFormat)
    return (
      <CsvImportResultBanner
        title={intl.formatMessage({ id: 'file-not-imported' })}
        content={intl.formatMessage({
          id: 'csv-import-fail-message',
        })}
        variant="danger"
      />
    )

  return isLoading ? (
    <Flex justifyContent={'center'}>
      <Spinner size={CapUIIconSize.Lg} color="primary.600" />
    </Flex>
  ) : (
    <Flex direction="column" gap={2}>
      {/* email already linked to an account */}
      {emailsAlreadyLinkedToAnAccount.length > 0 && (
        <CsvImportResultBanner
          key="email-already-registered-banner"
          title={intl.formatMessage(
            { id: 'import.users-already-registered' },
            { count: emailsAlreadyLinkedToAnAccount.length },
          )}
          variant="warning"
        />
      )}

      {/* email already received an invitation */}
      {emailsAlreadyReceivedInvitation.length > 0 && (
        <CsvImportResultBanner
          key="email-already-invited-banner"
          title={intl.formatMessage({ id: 'invitations.already-used-emails' }, { count: importedUsers.length })}
          content={getListAsString(emailsAlreadyReceivedInvitation)}
          variant="warning"
        />
      )}

      {/* valid users ready to import */}
      {invitableEmails.length > 0 && (
        <CsvImportResultBanner
          key="valid-users-banner"
          title={intl.formatMessage({ id: 'valid-users-for-import' }, { count: importedUsers.length })}
          variant="success"
        />
      )}

      {/* invalid data model */}
      {!importedUsers && !duplicateLines && invalidLines.length > 0 && (
        <CsvImportResultBanner
          key="invalid-data-model-banner"
          title={intl.formatMessage({ id: 'invalid-data-model' })}
          variant="danger"
        />
      )}

      {/* no user found */}
      {csvEmails && importedUsers.length === 0 && (
        <CsvImportResultBanner
          key="no-user-found-banner"
          title={intl.formatMessage({ id: 'valid-users-for-import' }, { count: importedUsers.length })}
          variant="danger"
        />
      )}

      {/* duplicates identified */}
      {duplicateLines.length > 0 && (
        <CsvImportResultBanner
          key="duplicates-found-banner"
          title={intl.formatMessage(
            { id: 'csv-import.duplicate-lines' },
            {
              count: duplicateLines.length,
              lines:
                duplicateLines.length === 1
                  ? duplicateEmailsLineNumbers[0]
                  : duplicateEmailsLineNumbers.slice(0, -1).join(', '),
              last: duplicateEmailsLineNumbers[duplicateEmailsLineNumbers.length - 1],
            },
          )}
          variant="warning"
          content={intl.formatMessage({ id: 'global.import.excluded-lines' }, { count: duplicateLines.length })}
        />
      )}

      {/* invalid emails */}
      {invalidLines.length > 0 && (
        <CsvImportResultBanner
          key="invalid-emails-banner"
          title={intl.formatMessage(
            { id: 'invitation.csv-bad-lines-error.title' },
            {
              count: invalidLines.length,
              lines:
                invalidLines.length === 1
                  ? invalidEmailsLineNumbers[0]
                  : invalidEmailsLineNumbers.slice(0, -1).join(', '),
              last: invalidEmailsLineNumbers[invalidEmailsLineNumbers.length - 1],
              // eslint-disable-next-line react/display-name
              b: (...chunks) => <>{chunks.join('')}</>,
            },
          )}
          content={intl.formatMessage(
            { id: 'invitation.csv-bad-lines-error.body' },
            {
              count: invalidLines.length,
              // eslint-disable-next-line react/display-name
              a: (...chunks) => (
                <Link href={helpLink} color="primary.600">
                  {chunks}
                </Link>
              ),
            },
          )}
          variant="danger"
        />
      )}
    </Flex>
  )
}

export default CsvImportResultBanners

const CsvImportResultBanner = ({ title, content, variant }: BannerProps): JSX.Element => {
  return (
    <InfoMessage variant={variant} className="import-results">
      {title && <InfoMessage.Title withIcon>{title}</InfoMessage.Title>}
      {content && <InfoMessage.Content>{content}</InfoMessage.Content>}
    </InfoMessage>
  )
}
