// @flow
import React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { mediaQueryMobile } from '~/utils/sizes';
import Image from './Image';
import Body from './Body';

export type ThemeProps = {|
  image: { src: string, alt: string },
  title: string,
  url: string,
  projectsMetrics?: number,
  articlesMetrics?: number,
  eventsMetrics?: number,
|};
type Props = {|
  theme: ThemeProps,
|};

const ThemeContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 250px;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.2);
  cursor: pointer;

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    width: 100%;
    height: 100%;
  }
`;

export function ThemeCard({ theme }: Props) {
  return (
    <ThemeContainer>
      <Image src={theme.image.src} alt={theme.image.alt} />
      <Body {...theme} />
    </ThemeContainer>
  );
}

export default ThemeCard;
