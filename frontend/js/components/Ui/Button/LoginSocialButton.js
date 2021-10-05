// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import tinycolor from 'tinycolor2';
import SocialIcon from '../Icons/SocialIcon';
import AppBox from '~ui/Primitives/AppBox';
import { baseUrl } from '~/config';

export type LoginSocialButtonType =
  | 'facebook'
  | 'openId'
  | 'franceConnect'
  | 'saml'
  | 'cas'
  | 'oauth2';

type Props = {|
  type: LoginSocialButtonType,
  switchUserMode?: boolean,
  labelColor?: string,
  buttonColor?: string,
  text?: string,
|};

type State = {
  +isHover: boolean,
};

export const getLabelColorForType = (type: LoginSocialButtonType, color?: string): string => {
  switch (type) {
    case 'openId':
      return color || 'white';
    case 'facebook':
    case 'saml':
    case 'cas':
    case 'franceConnect':
      return 'white';
    default:
      return 'white';
  }
};

export const getButtonColorForType = (type: LoginSocialButtonType, bgColor?: string): string => {
  switch (type) {
    case 'facebook':
      return '#3B5998';
    case 'openId':
      return bgColor || '#1b9bd1';
    case 'saml':
      return '#7498c0';
    case 'cas':
      return '#7498c0';
    case 'franceConnect':
      return '#034ea2';
    default:
      return '#034ea2';
  }
};
export const getButtonLinkForType = (
  type: LoginSocialButtonType,
  redirectUri: string,
  isInvitationSSO: boolean = false,
): string => {
  const destination = isInvitationSSO ? baseUrl : window && window.location.href;

  switch (type) {
    case 'facebook':
      return `/login/facebook?_destination=${destination}`;

    case 'openId':
    case 'oauth2':
      return `/login/openid?_destination=${redirectUri}`;

    case 'cas':
      return `/login-cas?_destination=${destination}`;

    case 'saml':
      return `/login-saml?_destination=${destination}`;

    case 'franceConnect':
      return redirectUri
        ? `/login/franceconnect?_destination=${redirectUri}`
        : `/login/franceconnect?_destination=${destination}`;
    default:
      return '';
  }
};

export const getButtonContentForType = (type: string): string => {
  switch (type) {
    case 'facebook':
      return 'Facebook';
    case 'saml':
      return 'Saml';
    case 'cas':
      return 'ARTUR';
    default:
      return '';
  }
};

export type LinkButtonProps = {|
  type: LoginSocialButtonType,
  labelColor?: string,
  buttonColor?: string,
  text?: string,
  children: React.Node,
|};

const LinkButton: StyledComponent<LinkButtonProps, {}, HTMLDivElement> = styled.div`
  position: relative;
  margin-top: 10px;
  height: 34px;
  width: 100%;
  border-radius: 3px;
  display: flex;

  && {
    color: ${props => getLabelColorForType(props.type, props.labelColor)};
    background-color: ${props => getButtonColorForType(props.type, props.buttonColor)};
  }

  .loginIcon {
    top: 0;
    fill: ${props => getLabelColorForType(props.type, props.labelColor)};
    background-color: ${props =>
      tinycolor(getButtonColorForType(props.type, props.buttonColor))
        .darken(10)
        .toString()};
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
          return 'transform: translate(3px, 2px) scale(1.3);';
        }
      }}
    }
  }

  a {
    width: 100%;
    text-decoration: none;
    color: ${props => getLabelColorForType(props.type, props.labelColor)};

    span {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: fit-content;
    }
  }

  &:focus,
  &:hover {
    background-color: ${props =>
      tinycolor(getButtonColorForType(props.type, props.buttonColor)).darken(10)};
    .loginIcon {
      background-color: ${props =>
        tinycolor(getButtonColorForType(props.type, props.buttonColor)).darken(20)};
    }
  }
`;

export const FranceConnectLink: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  margin-top: 8px;
  color: #00acc1;
  font-size: 13px;
  text-align: center;
  hr {
    margin-top: 8px;
    margin-bottom: 8px;
  }
`;

export const FranceConnectButton: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  position: relative;
  margin-top: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
  a[title] {
    text-transform: uppercase;
  }
  .loginIcon {
    & > svg {
      height: 45px;
    }
  }
`;

const GrandLyonConnectButton: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  position: relative;
  margin-top: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
  a {
    width: 100%;
  }
`;

export default class LoginSocialButton extends React.Component<Props, State> {
  state = {
    isHover: false,
  };

  render() {
    const { type, switchUserMode, text, labelColor, buttonColor } = this.props;
    const { isHover } = this.state;
    const redirectUri = switchUserMode
      ? `${baseUrl}/sso/switch-user`
      : window && window.location.href;

    if (text === 'grandLyonConnect') {
      return (
        <GrandLyonConnectButton type={text} labelColor={labelColor} buttonColor={buttonColor}>
          <a href={getButtonLinkForType(type, redirectUri)} title={type}>
            <SocialIcon className="loginIcon" name={text} />
          </a>
        </GrandLyonConnectButton>
      );
    }

    return (
      <div>
        {type === 'franceConnect' ? (
          <>
            <AppBox textAlign="center" mt={1} fontSize={2}>
              <FormattedMessage tagName="p" id="fc-title" />
            </AppBox>
            <FranceConnectButton>
              <a
                href={getButtonLinkForType(type, redirectUri)}
                title="FranceConnect"
                onMouseEnter={() => this.setState({ isHover: true })}
                onMouseLeave={() => this.setState({ isHover: false })}>
                {isHover ? (
                  <SocialIcon className="loginIcon" name={`${type}Hover`} />
                ) : (
                  <SocialIcon className="loginIcon" name={type} />
                )}
              </a>
            </FranceConnectButton>
            <FranceConnectLink>
              <a href="https://franceconnect.gouv.fr/">
                <FormattedMessage id="what-is-fc" />
              </a>
              <hr />
            </FranceConnectLink>
          </>
        ) : (
          <LinkButton type={type} labelColor={labelColor} buttonColor={buttonColor}>
            <SocialIcon className="loginIcon" name={type} />
            <a href={getButtonLinkForType(type, redirectUri)} title={type}>
              {text !== undefined ? (
                <span>{text}</span>
              ) : (
                <FormattedMessage id={getButtonContentForType(type)} />
              )}
            </a>
          </LinkButton>
        )}
      </div>
    );
  }
}
