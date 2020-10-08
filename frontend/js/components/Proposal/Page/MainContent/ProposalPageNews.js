// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { NavItem } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import colors from '~/utils/colors';
import NewsCard from '~/components/Ui/News/NewsCard';

import type { ProposalPageNews_proposal } from '~relay/ProposalPageNews_proposal.graphql';
import {
  Card,
  CategoryContainer,
  CategoryCircledIcon,
  CategoryTitle,
} from '~/components/Proposal/Page/ProposalPage.style';

type Props = {
  proposal: ?ProposalPageNews_proposal,
  goToBlog: () => void,
};

export const NewsCardHolder: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  > .Card {
    margin-bottom: 15px;
  }

  > li {
    list-style: none;

    svg {
      margin-right: 5px;
    }

    a {
      display: flex;
      align-items: center;
    }
  }
`;

export const ProposalPageNews = ({ proposal, goToBlog }: Props) => {
  if (!proposal) return null;
  const news = proposal?.news?.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean)
    .filter(e => e.title !== 'Réponse officielle'); // Cet homme est diplomé
  if (!news || !news.length) return null;

  return (
    <Card>
      <CategoryContainer>
        <CategoryTitle>
          <CategoryCircledIcon paddingLeft={9}>
            <Icon name={ICON_NAME.newspaper} size={20} color={colors.secondaryGray} />
          </CategoryCircledIcon>
          <h3>
            <FormattedMessage id="menu.news" />
          </h3>
        </CategoryTitle>
        <NewsCardHolder>
          <NewsCard post={news[0]} /> {news.length > 1 && <NewsCard post={news[1]} />}
          {news.length > 2 && (
            <NavItem eventKey="blog" onClick={goToBlog}>
              <Icon name={ICON_NAME.plus} size={16} color="currentColor" />
              <FormattedMessage id="global.more" />
            </NavItem>
          )}
        </NewsCardHolder>
      </CategoryContainer>
    </Card>
  );
};

export default createFragmentContainer(ProposalPageNews, {
  proposal: graphql`
    fragment ProposalPageNews_proposal on Proposal {
      id
      news {
        edges {
          node {
            id
            title
            ...NewsCard_post
          }
        }
      }
    }
  `,
});
