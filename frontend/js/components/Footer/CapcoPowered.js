// @flow
import React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';

type Props = {|
  textColor: string,
|};

const CapcoPoweredContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  text-align: center;
  width: 100%;
`;

const CapcoLogo: StyledComponent<{}, {}, HTMLImageElement> = styled.img`
  width: 20px;
  height: 20px;
  margin: 0 5px;
`;

const CapcoLink: StyledComponent<{ textColor: string }, {}, HTMLAnchorElement> = styled.a`
  font-weight: bold;
  color: ${props => props.textColor};
  :hover {
    color: ${props => props.textColor};
  }
`;

const CapcoPowered = ({ textColor }: Props) => (
  <CapcoPoweredContainer>
    <FormattedMessage id="powered_by" />
    <CapcoLogo src="/favicon-64x64.png" alt="cap collectif logo" />
    <CapcoLink textColor={textColor} href="https://cap-collectif.com">
      <span>Cap Collectif</span>
    </CapcoLink>
  </CapcoPoweredContainer>
);

export default CapcoPowered;
