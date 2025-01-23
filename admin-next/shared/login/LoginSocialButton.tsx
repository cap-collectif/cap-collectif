import React, { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'
import { Box, Link, Text } from '@cap-collectif/ui'
import SocialIcon from '@shared/ui/LegacyIcons/SocialIcon'
import getBaseUrl from '@shared/utils/getBaseUrl'

export type LoginSocialButtonType = 'facebook' | 'openId' | 'franceConnect' | 'saml' | 'cas' | 'oauth2'
type Props = {
  type: LoginSocialButtonType
  switchUserMode?: boolean
  text?: string
  justifyContent?: string
  noHR?: boolean
  primaryColor?: string
  colorText?: string
  fcTitle?: string
}
export const getLabelColorForType = (type: LoginSocialButtonType, color?: string): string => {
  switch (type) {
    case 'openId':
      return color || 'white'

    case 'facebook':
    case 'saml':
    case 'cas':
    case 'franceConnect':
      return 'white'

    default:
      return 'white'
  }
}
export const getButtonColorForType = (type: LoginSocialButtonType, bgColor?: string): string => {
  switch (type) {
    case 'facebook':
      return '#3B5998'

    case 'openId':
      return bgColor || '#1b9bd1'

    case 'saml':
      return '#7498c0'

    case 'cas':
      return '#7498c0'

    case 'franceConnect':
      return '#034ea2'

    default:
      return '#034ea2'
  }
}
export const getButtonLinkForType = (
  type: LoginSocialButtonType,
  redirectUri: string,
  isInvitationSSO: boolean = false,
): string => {
  const destination = isInvitationSSO ? getBaseUrl() : window && window.location.href

  switch (type) {
    case 'facebook':
      return `/login/facebook?_destination=${destination}`

    case 'openId':
    case 'oauth2':
      return `/login/openid?_destination=${redirectUri}`

    case 'cas':
      return `/login-cas?_destination=${destination}`

    case 'saml':
      return `/login-saml?_destination=${destination}`

    case 'franceConnect':
      return redirectUri
        ? `/login/franceconnect?_destination=${redirectUri}`
        : `/login/franceconnect?_destination=${destination}`

    default:
      return ''
  }
}
export const getButtonContentForType = (type: string): string => {
  switch (type) {
    case 'facebook':
      return 'Facebook'

    case 'saml':
      return 'Saml'

    case 'cas':
      return 'ARTUR'

    default:
      return ''
  }
}
export type LinkButtonProps = {
  type: LoginSocialButtonType
  labelColor?: string
  buttonColor?: string
  maxWidth?: string
  text?: string
  children: any
}
const LinkButton = styled.div<LinkButtonProps>`
  position: relative;
  margin-top: 10px;
  height: 34px;
  width: 100%;
  max-width: ${props => `${props.maxWidth}`};
  border-radius: 3px;
  display: flex;

  && {
    color: ${props => getLabelColorForType(props.type, props.labelColor)};
    background-color: ${props => getButtonColorForType(props.type, props.buttonColor)};
  }

  .loginIcon {
    top: 0;
    fill: ${props => getLabelColorForType(props.type, props.labelColor)};
    background-color: ${props => tinycolor(getButtonColorForType(props.type, props.buttonColor)).darken(10).toString()};
    height: 34px;
    width: 15%;
    border-radius: 3px 0 0 3px;
    display: flex;
    align-items: center;
    justify-content: center;

    & > svg {
      height: 60%;
      width: 100%;
      ${props => {
        if (props.type === 'openId' || props.type === 'saml' || props.type === 'cas') {
          return 'transform: translate(3px, 2px) scale(1.3);'
        }
      }}
    }
  }

  a {
    width: 100%;
    text-decoration: none;
    color: ${props => getLabelColorForType(props.type, props.labelColor)};
    display: flex;
    align-items: center;

    &:focus,
    &:hover {
      color: ${props => getLabelColorForType(props.type, props.labelColor)};
    }

    span {
      margin-left: 16px;
    }
  }

  &:focus,
  &:hover {
    background-color: ${props => tinycolor(getButtonColorForType(props.type, props.buttonColor)).darken(10)};
    .loginIcon {
      background-color: ${props => tinycolor(getButtonColorForType(props.type, props.buttonColor)).darken(20)};
    }
  }
`

export const FranceConnectButton = styled.div<{
  justifyContent: string
}>`
  position: relative;
  margin-top: 10px;
  width: 100%;
  display: flex;
  justify-content: ${props => props.justifyContent};
  a[title] {
    text-transform: uppercase;
  }
  .loginIcon {
    & > svg {
      height: 60px;
      width: 228px;
    }
  }
`
const GrandLyonConnectButton = styled.div`
  position: relative;
  margin-top: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
  a {
    width: 100%;
  }
`

const FC_COLOR = '#000091'

export const LoginSocialButton = ({
  type,
  switchUserMode,
  text,
  justifyContent = 'center',
  noHR = false,
  primaryColor,
  colorText,
  fcTitle = 'fc-title',
}: Props) => {
  const [isHover, seIsHover] = useState<boolean>(false)
  const redirectUri = switchUserMode ? `${getBaseUrl()}/sso/switch-user` : window && window.location.href
  const intl = useIntl()

  if (text === 'grandLyonConnect') {
    return (
      <GrandLyonConnectButton>
        <a href={getButtonLinkForType(type, redirectUri)} title={type}>
          <SocialIcon className="loginIcon" name={text} />
        </a>
      </GrandLyonConnectButton>
    )
  }

  const isFcRequirement = fcTitle === 'fc-requirement-title'
  return (
    <div>
      {type === 'franceConnect' ? (
        <>
          <Text
            // @ts-ignore rapatrier DS et fix
            textAlign={justifyContent}
            mt={1}
            lineHeight="s"
            fontSize={isFcRequirement ? '14px' : 2}
            color={isFcRequirement ? 'gray.700' : undefined}
          >
            <FormattedMessage tagName="p" id={fcTitle} />
          </Text>
          <FranceConnectButton justifyContent={justifyContent}>
            <a
              href={getButtonLinkForType(type, redirectUri)}
              title="FranceConnect"
              onMouseEnter={() => seIsHover(true)}
              onMouseLeave={() => seIsHover(false)}
            >
              {isHover ? (
                <SocialIcon className="loginIcon" name={`${type}Hover`} />
              ) : (
                <SocialIcon className="loginIcon" name={type} />
              )}
            </a>
          </FranceConnectButton>
          <Box mt={2} fontSize={2}>
            <Link
              color={FC_COLOR}
              _hover={{ color: FC_COLOR }}
              href="https://franceconnect.gouv.fr/"
              target="_blank"
              rel="noreferrer"
            >
              <FormattedMessage id="what-is-fc" />
            </Link>
            {!noHR ? (
              <Text textAlign="center" as="div" fontWeight="bold" color="neutral-gray.700" my={5}>
                {intl.formatMessage({
                  id: 'login.or',
                })}
              </Text>
            ) : null}
          </Box>
        </>
      ) : (
        <LinkButton type={type} labelColor={colorText} buttonColor={primaryColor}>
          <SocialIcon className="loginIcon" name={type} />
          <a href={getButtonLinkForType(type, redirectUri)} title={type}>
            {text !== undefined ? <span>{text}</span> : <FormattedMessage id={getButtonContentForType(type)} />}
          </a>
        </LinkButton>
      )}
    </div>
  )
}

export default LoginSocialButton
