// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import Post from '../../Blog/Post';
import type { ProposalPageBlog_proposal } from '~relay/ProposalPageBlog_proposal.graphql';

type Props = { proposal: ProposalPageBlog_proposal };

export class ProposalPageBlog extends React.Component<Props> {
  render() {
    const { proposal } = this.props;
    if (proposal.news.totalCount === 0) {
      return (
        <p>
          <FormattedMessage id="proposal.no_posts" />
        </p>
      );
    }
    return (
      <ul className="media-list">
        {proposal.news.edges &&
          proposal.news.edges
            .filter(Boolean)
            .map((edge, index) => <Post post={edge.node} key={index} />)}
      </ul>
    );
  }
}

export default createFragmentContainer(
  ProposalPageBlog,
  graphql`
    fragment ProposalPageBlog_proposal on Proposal {
      news {
        totalCount
        edges {
          node {
            ...Post_post
          }
        }
      }
    }
  `,
);
