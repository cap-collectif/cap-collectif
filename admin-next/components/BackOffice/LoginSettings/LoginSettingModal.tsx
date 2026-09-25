import { CapUIModalSize, Heading, Modal } from '@cap-collectif/ui'
import type { LoginSettingsListQuery$data } from '@relay/LoginSettingsListQuery.graphql'
import * as React from 'react'
import { useIntl } from 'react-intl'
import LoginSettingForm from './LoginSettingForm'

export type SiteParameter = LoginSettingsListQuery$data['loginSettings'][number]
export type AvailableLocale = LoginSettingsListQuery$data['availableLocales'][number]

type Props = {
  siteParameter: SiteParameter
  availableLocales: ReadonlyArray<AvailableLocale>
  disclosure: React.ReactElement
}

const LoginSettingModal: React.FC<Props> = ({ siteParameter, availableLocales, disclosure }) => {
  const intl = useIntl()

  return (
    // Jodit renders its popups (links, colors...) outside of the dialog: a modal dialog would trap the
    // focus away from them and close on the first click inside one of them.
    <Modal
      ariaLabel="edit-login-setting"
      size={CapUIModalSize.Md}
      disclosure={disclosure}
      hideOnClickOutside={false}
      forceModalDialogToFalse
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Modal.Header.Label>{intl.formatMessage({ id: 'admin.label.pages.login' })}</Modal.Header.Label>
            <Heading>{intl.formatMessage({ id: siteParameter.keyname })}</Heading>
          </Modal.Header>
          {/* The form lives with the modal body, so each opening starts from the latest saved values. */}
          <LoginSettingForm siteParameter={siteParameter} availableLocales={availableLocales} hide={hide} />
        </>
      )}
    </Modal>
  )
}

export default LoginSettingModal
