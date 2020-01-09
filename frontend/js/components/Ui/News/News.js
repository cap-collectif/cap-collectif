// @flow
import React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import Image from './Image';
import Body from './Body';
import colors from '~/utils/colors';

// TODO: improve typings in storybook
export type NewsProps = {|
  title: string,
  url: string,
  image: { src: string, alt: string },
  date: { released: string },
  theme: string,
  user: Object,
  body: string,
|};

type Props = {|
  news: NewsProps,
|};

export const NewsContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 100%;
  height: 182px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  display: flex;
  padding: 5px;
  box-sizing: border-box;
  align-items: center;
  background-color: ${colors.white};
  cursor: pointer;

  @media (max-width: 768px) {
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
`;

export function News({ news }: Props) {
  return (
    <React.Fragment>
      <NewsContainer>
        <Image src={news.image.src} alt={news.image.alt} />
        <Body news={news} />
      </NewsContainer>
    </React.Fragment>
  );
}

export default News;
