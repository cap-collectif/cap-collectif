// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import NewsCard from '~/components/Ui/News/NewsCard';
import type { ProposalPageBlog_proposal } from '~relay/ProposalPageBlog_proposal.graphql';

type Props = { proposal: ?ProposalPageBlog_proposal };

const ProposalPageBlogContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 100%;
  max-width: 950px;
  margin: auto;
  padding: 10px;

  .Card {
    margin-bottom: 10px;
  }
`;

export const ProposalPageBlog = ({ proposal }: Props) => {
  if (!proposal) return null;
  if (proposal.news.totalCount === 0) {
    return (
      <ProposalPageBlogContainer>
        <p>
          <FormattedMessage id="proposal.no_posts" />
        </p>
      </ProposalPageBlogContainer>
    );
  }
  return (
    <ProposalPageBlogContainer>
      <ul className="media-list">
        {proposal.news.edges &&
          proposal.news.edges
            .filter(Boolean)
            .filter(edge => edge?.node?.title !== 'Réponse officielle')
            .map((edge, index) => <NewsCard post={edge.node || null} key={index} withContent />)}
      </ul>
    </ProposalPageBlogContainer>
  );
};

export default createFragmentContainer(ProposalPageBlog, {
  proposal: graphql`
    fragment ProposalPageBlog_proposal on Proposal {
      news {
        totalCount
        edges {
          node {
            title
            ...NewsCard_post
          }
        }
      }
    }
  `,
});
