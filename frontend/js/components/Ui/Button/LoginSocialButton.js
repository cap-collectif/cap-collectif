// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import { darken } from 'polished';
import { baseUrl } from '../../../config';
import SocialIcon from '../Icons/SocialIcon';

type LoginSocialButtonType = 'facebook' | 'google' | 'openId' | 'franceConnect' | 'saml';

type Props = {|
  type: LoginSocialButtonType,
  switchUserMode?: boolean,
  labelColor?: string,
  buttonColor?: string,
  text?: string,
|};

type State = {
  labelColor: string,
  buttonColor: string,
  link: string,
  content: string,
};

const getLabelColorForType = (type: LoginSocialButtonType, color?: string): string => {
  switch (type) {
    case 'facebook':
      return 'white';
    case 'google':
      return 'white';
    case 'openId':
      return color || 'white';
    case 'saml':
      return 'white';
    case 'franceConnect':
      return 'white';
    default:
      return 'white';
  }
};
const getButtonColorForType = (type: LoginSocialButtonType, bgColor?: string): string => {
  switch (type) {
    case 'facebook':
      return '#3B5998';
    case 'google':
      return '#1b9bd1';
    case 'openId':
      return bgColor || '#1b9bd1';
    case 'saml':
      return '#7498c0';
    case 'franceConnect':
      return '#034ea2';
    default:
      return '#034ea2';
  }
};
const getButtonLinkForType = (type: LoginSocialButtonType, redirectUri: string): string => {
  switch (type) {
    case 'facebook':
      return `/login/facebook?_destination=${window && window.location.href}`;

    case 'google':
      return `/login/google?_destination=${window && window.location.href}`;

    case 'openId':
      return `/login/openid?_destination=${redirectUri}`;

    case 'saml':
      return `/login-saml?_destination=${window && window.location.href}`;

    case 'franceConnect':
      return `/login/franceconnect?_destination=${window && window.location.href}`;
    default:
      return '';
  }
};
const getButtonContentForType = (type: string): string => {
  switch (type) {
    case 'facebook':
      return 'Facebook';
    case 'google':
      return 'Google';
    case 'saml':
      return 'Saml';
    case 'franceConnect':
      return 'France Connect';
    default:
      return '';
  }
};

type LinkButtonProps = {|
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
    color: ${props => getLabelColorForType(props.type, props.labelColor)};
    background-color: ${props =>
      darken(0.1, getButtonColorForType(props.type, props.buttonColor))}; // tout est carré nan ?
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
        if (props.type === 'openId' || props.type === 'saml') {
          return 'transform: translate(3px, 2px) scale(1.3);';
        }
        if (props.type === 'franceConnect') {
          return 'transform: translate(6px, 4px) scale(1.7);';
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
    background-color: ${props => darken(0.1, getButtonColorForType(props.type, props.buttonColor))};

    .loginIcon {
      background-color: ${props =>
        darken(0.2, getButtonColorForType(props.type, props.buttonColor))};
    }
  }
`;

export default class LoginSocialButton extends React.Component<Props, State> {
  render() {
    const { type, switchUserMode, text, labelColor, buttonColor } = this.props;
    const redirectUri = switchUserMode
      ? `${baseUrl}/sso/switch-user`
      : `${window && window.location.href}`;
    return (
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
    );
  }
}
