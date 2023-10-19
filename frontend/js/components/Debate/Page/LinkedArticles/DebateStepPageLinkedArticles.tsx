import * as React from 'react'
import type { RelayFragmentContainer } from 'react-relay'
import { createFragmentContainer, graphql } from 'react-relay'
import moment from 'moment'
import { FormattedMessage } from 'react-intl'
import { useAnalytics } from 'use-analytics'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import Slider from 'react-slick'
import { useDisclosure } from '@liinkiing/react-hooks'
import { Skeleton, Heading, Flex, Button, Icon, CapUIIcon, CapUIIconSize, Box, useTheme } from '@cap-collectif/ui'
import type { DebateStepPageLinkedArticles_step } from '~relay/DebateStepPageLinkedArticles_step.graphql'
import DebateArticleCard from '~ui/DebateArticle/DebateArticleCard'
import DebateStepPageLinkedArticlesDrawer from '~/components/Debate/Page/Drawers/DebateStepPageLinkedArticlesDrawer'
import { DATE_SHORT_LOCALIZED_FORMAT } from '~/shared/date'
import DebateArticlePlaceholder from './DebateArticlePlaceholder'
type Props = {
  readonly step: DebateStepPageLinkedArticles_step | null | undefined
  readonly isMobile: boolean
}
const SLIDER_MAX_ARTICLES_MOBILE = 4
export const StyledSlider: StyledComponent<any, {}, typeof Slider> = styled(Slider)`
  .slick-slide {
    padding: 0 ${props => props.spacing};
    height: unset;
    & > div {
      height: 100%;
    }
  }

  .slick-track {
    display: flex;
    align-items: stretch;
  }
  .slick-arrow {
    background: black;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    opacity: 50%;
    padding: 3px 4px;
  }
  .slick-next {
    padding: 4px 8px;
  }
  .slick-prev {
    padding: 4px;
    padding-right: 6px;
  }
  .slick-next:before,
  .slick-prev:before {
    content: '';
  }
  .slick-dots li button:before {
    font-size: 10px;
  }
`
export const DebateStepPageLinkedArticles = ({ step, isMobile }: Props): JSX.Element => {
  const { track } = useAnalytics()
  const { isOpen, onClose, onOpen } = useDisclosure()
  const theme = useTheme()
  const debate = step?.debate
  const articles = debate?.articles?.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean)
  if (!articles || articles.length === 0) return null
  return (
    <Box id={step ? 'DebateStepPageLinkedArticles' : 'DebateStepPageLinkedArticlesLoading'}>
      {step && isMobile && <DebateStepPageLinkedArticlesDrawer onClose={onClose} isOpen={isOpen} step={step} />}
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
        }
      >
        {articles && articles.length > 0 && (
          <StyledSlider
            spacing={theme.space[3]}
            {...{
              infinite: false,
              dots: true,
              slidesToScroll: 1,
              slidesToShow: 3,
              arrows: true,
              nextArrow: (
                <Button className="slick-arrow slick-next">
                  <Icon name={CapUIIcon.ArrowRight} size={CapUIIconSize.Sm} color="white" />
                </Button>
              ),
              prevArrow: (
                <Button className="slick-arrow slick-prev">
                  <Icon name={CapUIIcon.ArrowLeft} size={CapUIIconSize.Sm} color="white" />
                </Button>
              ),
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
                    arrows: false,
                  },
                },
              ],
            }}
          >
            {articles.slice(0, isMobile ? SLIDER_MAX_ARTICLES_MOBILE : articles.length).map(article => (
              <Box
                as="a"
                height="100%"
                sx={{
                  userSelect: 'none',
                  '-webkit-user-drag': 'none',
                }}
                href={article.url}
                target="_blank"
                key={article.id}
                onClick={() => {
                  track('debate_article_click', {
                    article_url: article.url,
                    url: step?.debate.url || '',
                  })
                }}
              >
                <DebateArticleCard
                  height="100%"
                  illustration={article.coverUrl}
                  publishedAt={
                    article.publishedAt ? moment(article.publishedAt).format(DATE_SHORT_LOCALIZED_FORMAT) : null
                  }
                >
                  <DebateArticleCard.Title truncate={54}>{article.title}</DebateArticleCard.Title>
                  <DebateArticleCard.Origin>{article.origin}</DebateArticleCard.Origin>
                </DebateArticleCard>
              </Box>
            ))}
          </StyledSlider>
        )}
      </Skeleton>
    </Box>
  )
}
export default createFragmentContainer(DebateStepPageLinkedArticles, {
  step: graphql`
    fragment DebateStepPageLinkedArticles_step on DebateStep @argumentDefinitions(isMobile: { type: "Boolean!" }) {
      id
      debate {
        url
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
}) as RelayFragmentContainer<typeof DebateStepPageLinkedArticles>
