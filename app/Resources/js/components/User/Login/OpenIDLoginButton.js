// @flow
import * as React from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import { FormattedMessage } from 'react-intl';
import { baseUrl } from '../../../config';
import type { LabelPrefix } from './LoginSocialButtons';
import SocialIcon from '../../Ui/Icons/SocialIcon';

type Props = {|
  text: ?string,
  prefix?: LabelPrefix,
  buttonColor: string,
  labelColor: string,
  switchUserMode: boolean,
|};

const LinkButton = styled.div`
  && {
    color: ${props => props.labelColor};
    background-color: ${props => props.buttonColor};
  }

  .loginIcon {
    top: 0;
    /* content: '\\e00b'; */
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

export class OpenIDLoginButton extends React.Component<Props> {
  static displayName = 'OpenIDLoginButton';

  render() {
    const { switchUserMode, text, buttonColor, labelColor } = this.props;

    const title = <span>{text}</span> || <FormattedMessage id="login.openid" />;
    const redirectUri = switchUserMode
      ? `${baseUrl}/sso/switch-user`
      : `${window && window.location.href}`;

    console.log(`button :${buttonColor}`, `label :${labelColor}`);

    return (
      // <LinkButton
      //   href={`/login/openid?_destination=${redirectUri}`}
      //   title={title}
      //   className="btn login__social-btn"
      // labelColor={labelColor}
      // buttonColor={buttonColor}>
      //   {title}
      // </LinkButton>
      <LinkButton className="login__social-btn" labelColor={labelColor} buttonColor={buttonColor}>
        <SocialIcon className="loginIcon" name="default" />
        <a href={`/login/openid?_destination=${redirectUri}`} title={title}>
          {title}
        </a>
      </LinkButton>
    );
  }
}

export default OpenIDLoginButton;
