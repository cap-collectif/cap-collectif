import React from 'react'
import ModalLayout from '~/components/ParticipationWorkflow/ModalLayout'
import { graphql, useFragment } from 'react-relay'
import { useSelector } from 'react-redux'
import type { GlobalState } from '~/types'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { Box, useMultiStepModal } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import SSOButton from '~/components/User/Invitation/SSOButton'
import { EmailAccountLoginSSOForm_colors$key } from '~relay/EmailAccountLoginSSOForm_colors.graphql'
import { PARTICIPANT_FORM_INDEX } from '~/components/ParticipationWorkflow/EmailParticipantForm'
import { useParticipationWorkflow } from '~/components/ParticipationWorkflow/ParticipationWorkflowContext'

type Props = {
  children?: React.ReactNode
  colors: EmailAccountLoginSSOForm_colors$key
  modalTitle?: string
  modalInfo?: string
}

const COLORS_FRAGMENT = graphql`
  fragment EmailAccountLoginSSOForm_colors on SiteColor @relay(plural: true) {
    keyname
    value
  }
`

export const ACCOUNT_LOGIN_SSO_FORM_INDEX = 5

const EmailAccountLoginSSOForm: React.FC<Props> = ({ children, colors: colorsRef, modalTitle, modalInfo }) => {
  const colors = useFragment(COLORS_FRAGMENT, colorsRef)

  const { setCurrentStep } = useMultiStepModal()

  const { requirementsUrl } = useParticipationWorkflow()

  const goToParticipantForm = () => setCurrentStep(PARTICIPANT_FORM_INDEX)

  const intl = useIntl()
  const isCasEnabled = useFeatureFlag('login_cas')
  const isLoginSamlEnabled = useFeatureFlag('login_saml')

  const hasOauth2SwitchUser = useFeatureFlag('oauth2_switch_user')

  const buttonRef = React.useRef(null)

  React.useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [])

  let ssoList: any = useSelector<GlobalState>(state => state.default.ssoList)

  if (isCasEnabled) {
    ssoList = [...ssoList, { ssoType: 'cas', name: 'cas' }]
  }
  if (isLoginSamlEnabled) {
    ssoList = [...ssoList, { ssoType: 'saml', name: 'saml' }]
  }

  const { defaultPrimaryColor, defaultColorText } = useSelector((state: GlobalState) => {
    return {
      defaultPrimaryColor: state.default.parameters['color.btn.primary.bg'],
      defaultColorText: state.default.parameters['color.btn.primary.text'],
    }
  })

  const primaryColor = colors.find(color => color.keyname === 'color.btn.primary.bg')?.value || defaultPrimaryColor

  const btnTextColor = colors.find(color => color.keyname === 'color.btn.primary.text')?.value || defaultColorText

  return (
    <ModalLayout
      title={modalTitle || intl.formatMessage({ id: 'please-login-with' })}
      info={modalInfo || intl.formatMessage({ id: 'participation-sso-help-text' })}
      onClose={() => {}}
      onBack={goToParticipantForm}
    >
      <Box mt={4}>
        {ssoList.length > 0 &&
          ssoList
            .filter(({ ssoType }) => ['franceconnect', 'facebook'].includes(ssoType) === false)
            .map(({ name, ssoType }, index) => {
              return (
                <SSOButton
                  ref={buttonRef}
                  type={ssoType}
                  primaryColor={primaryColor}
                  key={index}
                  index={index}
                  btnTextColor={btnTextColor}
                  switchUserMode={hasOauth2SwitchUser}
                  text={name}
                  redirectUri={requirementsUrl}
                  destinationUri={requirementsUrl}
                  openInNewTab={false}
                />
              )
            })}
      </Box>
      {children && children}
    </ModalLayout>
  )
}

export default EmailAccountLoginSSOForm
