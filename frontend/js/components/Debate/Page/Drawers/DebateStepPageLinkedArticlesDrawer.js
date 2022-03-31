// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { createFragmentContainer, graphql, type RelayFragmentContainer } from 'react-relay';
import { Heading, Flex } from '@cap-collectif/ui';
import DetailDrawer from '~ds/DetailDrawer/DetailDrawer';
import type { DebateStepPageLinkedArticlesDrawer_step } from '~relay/DebateStepPageLinkedArticlesDrawer_step.graphql';
import DebateArticleCard from '~ui/DebateArticle/DebateArticleCard';
import { DATE_SHORT_LOCALIZED_FORMAT } from '~/shared/date';

type Props = {|
  +isOpen: boolean,
  +onClose?: () => void,
  +step: DebateStepPageLinkedArticlesDrawer_step,
|};

const DebateStepPageLinkedArticlesDrawer = ({ step, ...drawerProps }: Props): React.Node => {
  const articles =
    step?.debate?.articles?.edges
      ?.filter(Boolean)
      .map(edge => edge.node)
      .filter(Boolean) ?? [];
  if (!articles || articles.length === 0) return null;

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
            <a href={article.url} key={article.id} target="_blank" rel="noreferrer">
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

export default (createFragmentContainer(DebateStepPageLinkedArticlesDrawer, {
  step: graphql`
    fragment DebateStepPageLinkedArticlesDrawer_step on DebateStep {
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
}): RelayFragmentContainer<typeof DebateStepPageLinkedArticlesDrawer>);
