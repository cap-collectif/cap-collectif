// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { darken } from 'polished';
import { baseUrl } from '../../../config';
import SocialIcon from '../Icons/SocialIcon';

type Props = {|
  type: 'facebook' | 'google' | 'openId' | 'franceConnect' | 'saml',
  switchUserMode?: boolean,
|};

const LinkButton = styled.div`
  position: relative;
  margin-top: 10px;
  height: 34px;
  width: 100%;
  border-radius: 3px;
  display: flex;

  && {
    color: ${props => props.labelColor};
    background-color: ${props => props.buttonColor};
  }

  .loginIcon {
    top: 0;
    color: ${props => props.labelColor};
    background-color: ${props => props.buttonColor && darken(0.1, props.buttonColor)};
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
    color: ${props => props.labelColor};

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
    background-color: ${props => props.buttonColor && darken(0.1, props.buttonColor)};

    .loginIcon {
      background-color: ${props => props.buttonColor && darken(0.2, props.buttonColor)};
    }
  }
`;

export default class LoginSocialButton extends React.Component<Props> {
  render() {
    const { type, switchUserMode } = this.props;

    const redirectUri = switchUserMode
      ? `${baseUrl}/sso/switch-user`
      : `${window && window.location.href}`;

    let labelColor = '';
    let buttonColor = '';
    let link = '';
    let content = '';

    switch (type) {
      case 'facebook':
        labelColor = 'white';
        buttonColor = '#3B5998';
        link = `/login/facebook?_destination=${window && window.location.href}`;
        content = 'Facebook';
        break;

      case 'google':
        labelColor = 'white';
        buttonColor = '#1b9bd1';
        link = `/login/google?_destination=${window && window.location.href}`;
        content = 'Google';
        break;

      case 'openId':
        labelColor = 'white';
        buttonColor = '#1b9bd1';
        link = `/login/openid?_destination=${redirectUri}`;
        content = 'Open ID';
        break;

      case 'saml':
        labelColor = 'white';
        buttonColor = '#7498c0';
        link = `/login-saml?_destination=${window && window.location.href}`;
        content = 'Saml';
        break;

      case 'franceConnect':
        labelColor = 'white';
        buttonColor = '#034ea2';
        link = `/login/franceconnect?_destination=${window && window.location.href}`;
        content = 'France Connect';
        break;
      default:
    }

    return (
      <LinkButton type={type} labelColor={labelColor} buttonColor={buttonColor}>
        <SocialIcon className="loginIcon" name={type} />
        <a href={link} title={type}>
          <FormattedMessage id={content} />
        </a>
      </LinkButton>
    );
  }
}
