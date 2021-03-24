// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import type { StyledComponent } from 'styled-components';
import styled from 'styled-components';
import Slider from 'react-slick';
import { useDisclosure } from '@liinkiing/react-hooks';
import type { DebateStepPageLinkedArticles_step } from '~relay/DebateStepPageLinkedArticles_step.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Heading from '~ui/Primitives/Heading';
import Flex from '~ui/Primitives/Layout/Flex';
import DebateArticleCard from '~ui/DebateArticle/DebateArticleCard';
import Button from '~ds/Button/Button';
import DebateStepPageLinkedArticlesDrawer from '~/components/Debate/Page/Drawers/DebateStepPageLinkedArticlesDrawer';
import { DATE_SHORT_LOCALIZED_FORMAT } from '~/shared/date';
import Skeleton from '~ds/Skeleton';
import DebateArticlePlaceholder from './DebateArticlePlaceholder';

type Props = {|
  +step: ?DebateStepPageLinkedArticles_step,
  +isMobile: boolean,
|};

const SLIDER_MAX_ARTICLES_MOBILE = 4;

export const StyledSlider: StyledComponent<{}, {}, typeof Slider> = styled(Slider)`
  .slick-slide {
    padding: 0 ${props => props.theme.space[3]};
    height: unset;
    & > div {
      height: 100%;
    }
  }

  .slick-track {
    display: flex;
    align-items: stretch;
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
      {step && isMobile && (
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
      <Skeleton
        isLoaded={!!step}
        placeholder={
          <Flex direction={['column', 'row']} spacing={4}>
            <DebateArticlePlaceholder />
            <DebateArticlePlaceholder />
            <DebateArticlePlaceholder />
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
                <AppBox
                  as="a"
                  height="100%"
                  css={{
                    userSelect: 'none',
                    '-webkit-user-drag': 'none',
                  }}
                  href={article.url}
                  key={article.id}>
                  <DebateArticleCard
                    height="100%"
                    illustration={article.coverUrl}
                    publishedAt={
                      article.publishedAt
                        ? moment(article.publishedAt).format(DATE_SHORT_LOCALIZED_FORMAT)
                        : null
                    }>
                    <DebateArticleCard.Title truncate={54}>{article.title}</DebateArticleCard.Title>
                    <DebateArticleCard.Origin>{article.origin}</DebateArticleCard.Origin>
                  </DebateArticleCard>
                </AppBox>
              ))}
          </StyledSlider>
        )}
      </Skeleton>
    </AppBox>
  );
};

export default createFragmentContainer(DebateStepPageLinkedArticles, {
  step: graphql`
    fragment DebateStepPageLinkedArticles_step on DebateStep
      @argumentDefinitions(isMobile: { type: "Boolean!" }) {
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
      ...DebateStepPageLinkedArticlesDrawer_step @include(if: $isMobile)
    }
  `,
});
