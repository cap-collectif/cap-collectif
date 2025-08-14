import React from 'react'
import { Box, Flex, useMultiStepModal } from '@cap-collectif/ui'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { useSelector } from 'react-redux'
import { getButtonLinkForType } from '@shared/login/LoginSocialButton'
import { ACCOUNT_LOGIN_FORM_INDEX } from '~/components/ParticipationWorkflow/EmailAccountLoginForm'
import { ACCOUNT_FRANCE_CONNECT_INDEX } from '~/components/ParticipationWorkflow/FranceConnectRequirementModal'
import { ACCOUNT_LOGIN_SSO_FORM_INDEX } from '~/components/ParticipationWorkflow/EmailAccountLoginSSOForm'
import { useParticipationWorkflow } from '~/components/ParticipationWorkflow/ParticipationWorkflowContext'
import LoginChoicesSVG from '~/components/ParticipationWorkflow/assets/LoginChoicesSVG'

type Props = {
  selected: 'ACCOUNT_LOGIN_FORM' | 'ACCOUNT_LOGIN_FRANCE_CONNECT_FORM' | 'ACCOUNT_LOGIN_SSO_FORM'
};




const Button = ({ onClick, children }) => {
  return (
    <Box border="none" backgroundColor="inherit" as="button" type="button" onClick={onClick}>{children}</Box>
  )
}


const LoginChoices: React.FC<Props> = ({
                                         selected,
                                       }) => {
  const {setCurrentStep} = useMultiStepModal()
  const isFCEnabled = useFeatureFlag('login_franceconnect')
  const isFacebookEnabled = useFeatureFlag('login_facebook')
  const isCasEnabled = useFeatureFlag('login_cas');
  const isLoginSamlEnabled = useFeatureFlag('login_saml');
  const { requirementsUrl } = useParticipationWorkflow()


  let ssoList = useSelector((state) => state.default.ssoList)
    .filter(sso => ['franceconnect', 'facebook'].includes(sso.ssoType) === false)

  if (isCasEnabled) {
    ssoList = [...ssoList, { ssoType: 'cas', name: 'cas' }]
  }
  if (isLoginSamlEnabled) {
    ssoList = [...ssoList, { ssoType: 'saml', name: 'saml' }]
  }

  const onEmailClick = () => setCurrentStep(ACCOUNT_LOGIN_FORM_INDEX)
  const onFranceConnectClick = () => setCurrentStep(ACCOUNT_FRANCE_CONNECT_INDEX)
  const onFacebookClick = () => {
    const redirectUri = requirementsUrl
    const destinationUri = requirementsUrl
    window.location.href = getButtonLinkForType('facebook', redirectUri, destinationUri) ?? redirectUri
  }

  const onSSOClick = () => {
    if (ssoList.length > 1) {
      setCurrentStep(ACCOUNT_LOGIN_SSO_FORM_INDEX)
      return;
    }
    const type = ssoList[0].ssoType;
    const redirectUri = requirementsUrl
    const destinationUri = requirementsUrl
    window.location.href = getButtonLinkForType(type, redirectUri, destinationUri) ?? redirectUri
  }

  return (
    <>
      <Flex justifyContent="center" spacing={4} my={4}>
        <Button onClick={onEmailClick}><LoginChoicesSVG name="EMAIL" selected={selected === 'ACCOUNT_LOGIN_FORM'}/></Button>
        {
          isFCEnabled && (
            <Button onClick={onFranceConnectClick}>
              <LoginChoicesSVG name="FRANCE_CONNECT" selected={selected === 'ACCOUNT_LOGIN_FRANCE_CONNECT_FORM'}/>
            </Button>
          )
        }
        {
          ssoList.length > 0 && (
            <Button onClick={onSSOClick}><LoginChoicesSVG name="SSO" selected={selected === 'ACCOUNT_LOGIN_SSO_FORM'}/></Button>
          )
        }
        {
          isFacebookEnabled && (
            <Button onClick={onFacebookClick}>
              <LoginChoicesSVG name="FACEBOOK" selected={false}/>
            </Button>
          )
        }
      </Flex>
    </>

  )
}

export default LoginChoices