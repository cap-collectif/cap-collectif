// @flow
import * as React from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import { FormattedMessage } from 'react-intl';
import { baseUrl } from '../../../config';
import type { LabelPrefix } from './LoginSocialButtons';

type Props = {|
  text: ?string,
  prefix?: LabelPrefix,
  buttonColor: string,
  labelColor: string,
  switchUserMode: boolean,
|};

const LinkButton = styled.a`
  && {
    color: ${props => props.labelColor};
    background-color: ${props => props.buttonColor};
    border: 0;
    padding-top: 7px;
  }

  &:before {
    top: 0;
    content: '\\e00b';
    color: ${props => darken(0.1, props.labelColor)};
    background-color: ${props => darken(0.1, props.buttonColor)};
  }

  &:focus,
  &:hover {
    background-color: ${props => darken(0.1, props.buttonColor)};

    &:before {
      background-color: ${props => darken(0.1, props.buttonColor)};
    }
  }
`;

export class OpenIDLoginButton extends React.Component<Props> {
  static displayName = 'OpenIDLoginButton';

  render() {
    const { switchUserMode, text, buttonColor, labelColor } = this.props;

    const title = text || <FormattedMessage id="login.openid" />;
    const redirectUri = switchUserMode
      ? `${baseUrl}/sso/switch-user`
      : `${window && window.location.href}`;

    return (
      <LinkButton
        href={`/login/openid?_destination=${redirectUri}`}
        title={title}
        className="btn login__social-btn"
        labelColor={labelColor}
        buttonColor={buttonColor}>
        {title}
      </LinkButton>
    );
  }
}

export default OpenIDLoginButton;
