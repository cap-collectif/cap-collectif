// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';

type Props = {|
  color: string,
  message: string,
  url: string,
  children: React.Node,
|};
const IconLinkBarContainer: StyledComponent<{ color: string }, {}, HTMLDivElement> = styled.div`
  display: flex;
  align-items: center;
  height: 45px;
  border-top: 1px solid #e3e3e3;
  color: ${props => `${props.color} !important`};
  padding-left: 15px;
  a {
    font-family: OpenSans, helvetica, arial, sans-serif;
    font-size: 16px;
    color: ${props => `${props.color} !important`};
    margin-left: 15px;
  }
`;

const IconLinkBar = ({ color, message, url, children }: Props) => (
  <IconLinkBarContainer color={color}>
    {children}
    <a href={url}>
      <FormattedMessage id={message} />
    </a>
  </IconLinkBarContainer>
);

export default IconLinkBar;
