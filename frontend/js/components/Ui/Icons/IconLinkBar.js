// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';

type Props = {|
  color: string,
  message: string,
  url: string,
  children: React.Node,
  noBorderTop?: boolean,
|};
const IconLinkBarContainer: StyledComponent<
  { color: string, noBorderTop?: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  display: flex;
  align-items: center;
  height: 45px;
  border-top: ${props => (props.noBorderTop ? 'none' : '1px solid #e3e3e3')};
  color: ${props => `${props.color} !important`};
  padding-left: 15px;

  a {
    font-family: OpenSans, helvetica, arial, sans-serif;
    font-size: 16px;
    color: ${props => `${props.color} !important`};
    margin-left: 15px;
  }
  a:hover {
    text-decoration: none;
  }
`;

const IconLinkBar = ({ color, message, url, children, noBorderTop }: Props) => (
  <IconLinkBarContainer color={color} noBorderTop={noBorderTop}>
    {children}
    <a href={url}>
      <FormattedMessage id={message} />
    </a>
  </IconLinkBarContainer>
);

export default IconLinkBar;
