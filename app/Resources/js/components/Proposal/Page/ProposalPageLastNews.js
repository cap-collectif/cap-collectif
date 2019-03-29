// @flow
import * as React from 'react';
import classNames from 'classnames';
import { graphql, createFragmentContainer } from 'react-relay';
import AnswerBody from '../../Answer/AnswerBody';
import type { ProposalPageLastNews_proposal } from './__generated__/ProposalPageLastNews_proposal.graphql';

export class ProposalPageLastNews extends React.Component<{
  proposal: ProposalPageLastNews_proposal,
  className: string,
}> {
  static defaultProps = {
    className: '',
  };

  render() {
    const { proposal, className } = this.props;
    if (proposal.news.totalCount === 0 || !proposal.news.edges) {
      return null;
    }
    const edge = proposal.news.edges[0];
    if (!edge || typeof edge === 'undefined') {
      return null;
    }
    const post = edge.node;
    const classes = {
      'bg-vip p-10': post.authors[0] && post.authors[0].vip,
      block: true,
      className: false,
    };
    if (className) {
      classes[className] = true;
    }

    return (
      <div className={classNames(classes)}>
        {post.title && <h3 className="h3 proposal__last__news__title">{post.title}</h3>}
        {/* $FlowFixMe $refType */}
        <AnswerBody answer={edge.node} />
      </div>
    );
  }
}
export default createFragmentContainer(
  ProposalPageLastNews,
  graphql`
    fragment ProposalPageLastNews_proposal on Proposal {
      news {
        totalCount
        edges {
          node {
            ...AnswerBody_answer
            title
            authors {
              vip
            }
          }
        }
      }
    }
  `,
);
