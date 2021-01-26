// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import type { Props as DetailDrawerProps } from '~ds/DetailDrawer/DetailDrawer';
import type { DebateStepPageLinkedArticles_step } from '~relay/DebateStepPageLinkedArticles_step.graphql';
import DetailDrawer from '~ds/DetailDrawer/DetailDrawer';
import Heading from '~ui/Primitives/Heading';
import Flex from '~ui/Primitives/Layout/Flex';
import DebateArticleCard from '~ui/DebateArticle/DebateArticleCard';
import { DATE_SHORT_LOCALIZED_FORMAT } from '~/shared/date';

const DebateStepPageLinkedArticlesDrawer = ({
  step,
  ...drawerProps
}: {|
  ...DetailDrawerProps,
  +step: DebateStepPageLinkedArticles_step,
|}) => {
  const articles =
    step.debate.articles?.edges
      ?.filter(Boolean)
      .map(edge => edge.node)
      .filter(Boolean) ?? [];
  return (
    <DetailDrawer {...drawerProps}>
      <DetailDrawer.Header display="grid" gridTemplateColumns="1fr 10fr 1fr" textAlign="center">
        <Heading as="h3">
          <FormattedMessage id="related.articles" />
        </Heading>
      </DetailDrawer.Header>
      <DetailDrawer.Body>
        <Flex direction="column" spacing={4} mb={4}>
          {articles.map(article => (
            <a href={article.url} key={article.id}>
              <DebateArticleCard
                illustration={article.coverUrl}
                publishedAt={
                  article.publishedAt
                    ? moment(article.publishedAt).format(DATE_SHORT_LOCALIZED_FORMAT)
                    : null
                }>
                <DebateArticleCard.Title>{article.title}</DebateArticleCard.Title>
                <DebateArticleCard.Origin>{article.origin}</DebateArticleCard.Origin>
              </DebateArticleCard>
            </a>
          ))}
        </Flex>
      </DetailDrawer.Body>
    </DetailDrawer>
  );
};

export default DebateStepPageLinkedArticlesDrawer;
