// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import ReactPlaceholder from 'react-placeholder';
import { FormattedMessage } from 'react-intl';
import type { StyledComponent } from 'styled-components';
import styled from 'styled-components';
import Slider from 'react-slick';
import { useDisclosure } from '@liinkiing/react-hooks';
import type { DebateStepPageLinkedArticles_step } from '~relay/DebateStepPageLinkedArticles_step.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Heading from '~ui/Primitives/Heading';
import Flex from '~ui/Primitives/Layout/Flex';
import DebateOpinionPlaceholder from '~/components/Debate/Opinion/DebateOpinionPlaceholder';
import DebateArticleCard from '~ui/DebateArticle/DebateArticleCard';
import Button from '~ds/Button/Button';
import DebateStepPageLinkedArticlesDrawer from '~/components/Debate/Page/Drawers/DebateStepPageLinkedArticlesDrawer';

type Props = {|
  +step: ?DebateStepPageLinkedArticles_step,
  +isMobile: boolean,
|};

const SLIDER_MAX_ARTICLES_MOBILE = 4;

export const StyledSlider: StyledComponent<{}, {}, typeof Slider> = styled(Slider)`
  .slick-slide {
    padding: 0 16px;
  }

  .slick-track {
    display: flex;
    align-items: center;
  }
`;

export const DebateStepPageLinkedArticles = ({ step, isMobile }: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const debate = step?.debate;
  const articles = debate?.articles?.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean);
  if (!articles || articles.length === 0) return null;
  return (
    <AppBox id={step ? 'DebateStepPageLinkedArticles' : 'DebateStepPageLinkedArticlesLoading'}>
      {step && step.debate && isMobile && (
        <DebateStepPageLinkedArticlesDrawer onClose={onClose} isOpen={isOpen} step={step} />
      )}
      <Flex mb={6}>
        <Heading as="h3" fontWeight="400">
          <FormattedMessage id="related.articles" />
        </Heading>
        {isMobile && (
          <Button onClick={onOpen} variant="link" ml="auto">
            <FormattedMessage id="global.show_all" />
          </Button>
        )}
      </Flex>
      <ReactPlaceholder
        ready={!!step}
        customPlaceholder={
          <Flex direction={['column', 'row']} spacing={4}>
            <DebateOpinionPlaceholder debateOpinionStatus="FOR" />
            <DebateOpinionPlaceholder debateOpinionStatus="AGAINST" />
          </Flex>
        }>
        {articles && articles.length > 0 && (
          <StyledSlider
            {...{
              infinite: false,
              dots: true,
              slidesToScroll: 1,
              slidesToShow: 3,
              arrows: false,
              responsive: [
                {
                  breakpoint: 1200,
                  settings: {
                    slidesToShow: 2,
                  },
                },
                {
                  breakpoint: 600,
                  settings: {
                    slidesToShow: 1,
                  },
                },
              ],
            }}>
            {articles
              .slice(0, isMobile ? SLIDER_MAX_ARTICLES_MOBILE : articles.length)
              .map(article => (
                <a href={article.url} key={article.id}>
                  <DebateArticleCard
                    illustration={article.coverUrl}
                    publishedAt={article.publishedAt}>
                    <DebateArticleCard.Title>{article.title}</DebateArticleCard.Title>
                    <DebateArticleCard.Origin>{article.origin}</DebateArticleCard.Origin>
                  </DebateArticleCard>
                </a>
              ))}
          </StyledSlider>
        )}
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
