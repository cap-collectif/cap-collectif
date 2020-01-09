// @flow
import React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import CroppedLabel from '../Labels/CroppedLabel';
import { type NewsProps } from './News';

type Props = {|
  news: NewsProps,
|};

const BodyContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  flex: 2;
  width: 100%;
  height: 100%;
  margin: 10px;

  @media (max-width: 768px) {
    font-size: 25px;
    margin-left: 25px;

    .news--body-text_container {
      width: 100%;
      height: 100%;
      display: flex;
    }
  }

  @media (max-width: 992px) {
    .news--body-text_container {
      width: 100%;
      height: 100%;
      margin: 10px;
    }
  }

  @media (min-width: 1200px) {
    .news--subtitle {
      line-height: 60px;
    }
  }
`;

const Title: StyledComponent<{}, {}, HTMLHeadingElement> = styled.h1`
  font-size: 30px;
  justify-content: flex-start;
  padding: 0;
  margin: 0;
  display: flex;

  @media (max-width: 992px) {
    .news--title {
      line-height: 25px;
      font-size: 25px;
    }
  }
`;

const NewsInfos: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: block;
  color: gray;
  font-size: 14px;
  line-height: 30px;
  .label {
    background-color: gray;
    border-radius: 4px;
    margin: 5px;
    font-size: 12px;
    text-shadow: 1px 1px 2px black;
    cursor: pointer;
  }
`;

const Paraph: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  font-size: 20px;
  margin-left: 5px;
`;

export function Body({ news }: Props) {
  return (
    <React.Fragment>
      <BodyContainer>
        <Title>
          <a href={news.url}>{news.title}</a>
        </Title>

        <NewsInfos>
          <CroppedLabel label={{ name: news.theme, color: '#66666e' }} />
          <FormattedMessage id="global.byDate" values={{ date: news.date.released }} />{' '}
          <FormattedMessage id="global.byAuthor" values={{ author: news.user.username }} />
        </NewsInfos>
        <Paraph>{news.body}</Paraph>
      </BodyContainer>
    </React.Fragment>
  );
}

export default Body;
