// @flow
import * as React from 'react';
import ReactPlaceholder from 'react-placeholder';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import Slider from 'react-slick';
import styled, { type StyledComponent } from 'styled-components';
import type { DebateStepPageLinkedArticles_step } from '~relay/DebateStepPageLinkedArticles_step.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import DebateOpinionPlaceholder from '~/components/Debate/Opinion/DebateOpinionPlaceholder';
import Heading from '~ui/Primitives/Heading';
import DebateArticleCard from '~ui/DebateArticle/DebateArticleCard';

export const StyledSlider: StyledComponent<{}, {}, typeof Slider> = styled(Slider)`
  .slick-slide {
    padding: 0 16px;
  }

  .slick-track {
    display: flex;
    align-items: center;
  }
`;

type Props = {|
  +step: ?DebateStepPageLinkedArticles_step,
|};

export const DebateStepPageLinkedArticles = ({ step }: Props) => {
  const debate = step?.debate;
  const articles = debate?.articles?.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean);
  return (
    <AppBox id={step ? 'DebateStepPageLinkedArticles' : 'DebateStepPageLinkedArticlesLoading'}>
      <Heading as="h3" fontWeight="400" mb={6}>
        <FormattedMessage id="related.articles" />
      </Heading>
      <ReactPlaceholder
        ready={!!step}
        customPlaceholder={
          <Flex direction={['column', 'row']} spacing={4}>
            <DebateOpinionPlaceholder debateOpinionStatus="FOR" />
            <DebateOpinionPlaceholder debateOpinionStatus="AGAINST" />
          </Flex>
        }>
        <StyledSlider
          {...{
            dots: true,
            slidesToScroll: 1,
            slidesToShow: 2,
            arrows: false,
          }}>
          {articles?.map(article => (
            <a href={article.url}>
              <DebateArticleCard illustration={article.coverUrl} publishedAt={article.publishedAt}>
                <DebateArticleCard.Title>{article.title}</DebateArticleCard.Title>
                <DebateArticleCard.Origin>{article.origin}</DebateArticleCard.Origin>
              </DebateArticleCard>
            </a>
          ))}
        </StyledSlider>
      </ReactPlaceholder>
    </AppBox>
  );
};

export default createFragmentContainer(DebateStepPageLinkedArticles, {
  step: graphql`
    fragment DebateStepPageLinkedArticles_step on DebateStep {
      id
      debate {
        articles {
          edges {
            node {
              id
              url
              coverUrl
              title
              publishedAt
              origin
            }
          }
        }
      }
    }
  `,
});
