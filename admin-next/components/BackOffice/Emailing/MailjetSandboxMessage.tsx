import { InfoMessage, Link } from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import * as React from 'react'
import { useIntl } from 'react-intl'

/**
 * Shows super admins whether campaign emails are really sent (Mailjet sandbox disabled) on this platform.
 */
const MailjetSandboxMessage: React.FC = () => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const isMailjetSandboxEnabled = useFeatureFlag('mailjet_sandbox')

  if (!viewerSession.isSuperAdmin) return null

  return (
    <InfoMessage variant={isMailjetSandboxEnabled ? 'info' : 'danger'}>
      <InfoMessage.Content>
        {intl.formatMessage({ id: `emailing-mailjet-sandbox-${isMailjetSandboxEnabled ? 'on' : 'off'}` })}{' '}
        <Link href="/admin-next/features">Mailjet Sandbox</Link>
      </InfoMessage.Content>
    </InfoMessage>
  )
}

export default MailjetSandboxMessage
