import React from 'react'
import type { LoginSocialButtonType } from '@shared/login/LoginSocialButton'
import { getButtonContentForType, getButtonLinkForType } from '@shared/login/LoginSocialButton'
import SocialIcon from '@shared/ui/LegacyIcons/Icon'
import { baseUrl } from '~/config'
import Link from '~ds/Link/Link'

import {
  FranceConnectButton,
  LinkButton,
  PrimarySSOButton,
  SecondarySSOButton,
  TertiarySSOButton,
} from '~/components/User/Invitation/SSOButton.style'
type Props = {
  readonly primaryColor?: string
  readonly btnTextColor?: string
  readonly type: LoginSocialButtonType
  readonly index?: number
  readonly switchUserMode?: boolean
  readonly text?: string
  readonly redirectUri?: string
  readonly destinationUri?: string
  readonly openInNewTab?: boolean
}


const SSOButton = React.forwardRef(({ primaryColor, btnTextColor, type, index, switchUserMode, text, redirectUri, destinationUri, openInNewTab = true }: Props, ref) => {
  {
    if (!redirectUri) {
      redirectUri = switchUserMode ? `${baseUrl}/sso/switch-user` : baseUrl
    }

    if (!destinationUri) {
      destinationUri = baseUrl
    }

    const link = getButtonLinkForType(type, redirectUri, destinationUri)
    const linkText = text ?? getButtonContentForType(type)
    const target = openInNewTab ? '_blank' : '_self'

    if (type === 'facebook') {
      return (
        <LinkButton type="facebook">
          <SocialIcon className="loginIcon" name={type} />
          <a href={link} title={type} target="_blank" rel="noreferrer">
            <span>{linkText}</span>
          </a>
        </LinkButton>
      )
    }

    if (type === 'franceConnect') {
      return (
        <FranceConnectButton>
          <Link href={link} target={target} width="100%" display="block">
            <SocialIcon className="loginIcon" name={type} />
          </Link>
        </FranceConnectButton>
      )
    }

    if (index === 0) {
      return (
        <PrimarySSOButton ref={ref} backgroundColor={primaryColor} textColor={btnTextColor} href={link} target={target}>
          {linkText}
        </PrimarySSOButton>
      )
    }

    if (index === 1) {
      return (
        <SecondarySSOButton borderColor={primaryColor} textColor={primaryColor} href={link} target={target}>
          {linkText}
        </SecondarySSOButton>
      )
    }

    return (
      <TertiarySSOButton textColor={primaryColor} href={link} target={target}>
        {linkText}
      </TertiarySSOButton>
    )
  }
})
export default SSOButton
