// @flow
import * as React from 'react';
import styled from 'styled-components';
import { darken } from 'polished';

const LinkButton = styled.a`
  && {
    color: #ffffff;
    background-color: #034ea2;
    border: 0;
    padding-top: 7px;
  }

  &:before {
    top: 0;
    content: url('/svg/france-connect.svg');
    background-color: ${darken(0.1, '#034EA2')};
  }

  &:focus,
  &:hover {
    background-color: ${darken(0.1, '#034EA2')};

    &:before {
      background-color: ${darken(0.1, '#034EA2')};
    }
  }
`;

export class FranceConnectLoginButton extends React.Component<{}> {
  render() {
    return (
      <LinkButton
        href={`/login/franceconnect?_destination=${window && window.location.href}`}
        title="France Connect"
        className="btn login__social-btn">
        France Connect
      </LinkButton>
    );
  }
}

export default FranceConnectLoginButton;
