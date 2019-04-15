// @flow
import * as React from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import moment from 'moment';
import { graphql, createFragmentContainer } from 'react-relay';
import Truncate from 'react-truncate';
import classNames from 'classnames';
import type { VoteItem_vote } from '~relay/VoteItem_vote.graphql';
import UserAvatar from '../User/UserAvatar';
import UserLink from '../User/UserLink';

type Props = {
  vote: VoteItem_vote,
};

type ListVoteItemProps = {
  children: React.Node,
};

const ListVoteItem = ({ children }: ListVoteItemProps) => (
  <li className="opinion  opinion--vote block  block--bordered  box">{children}</li>
);

export class VoteItem extends React.Component<Props> {
  render() {
    const { vote } = this.props;

    let voteType = 'votes.type.propositionVote';
    let voteVerbe = 'votes.has';
    let voteLabelClass = classNames('label', 'label-success');
    let voteLabel = 'votes.value.voteFor';

    if (vote.value !== null && vote.value === 'YES') {
      voteVerbe = 'votes.is';
      voteLabelClass = classNames('label', 'label-success');
      voteLabel = 'votes.value.agree';
    } else if (vote.value !== null && vote.value === 'NO') {
      voteVerbe = 'votes.isNot';
      voteLabelClass = classNames('label', 'label-danger');
      voteLabel = 'votes.value.disagree';
    } else if (vote.value !== null && vote.value === 'MITIGE') {
      voteVerbe = 'votes.is';
      voteLabelClass = classNames('label', 'label-warning');
      voteLabel = 'votes.value.mitigated';
    }

    if (vote.__typename === 'commentVote') {
      voteType = 'votes.type.commentary';
    } else if (vote.value !== null) {
      voteType = 'votes.type.proposition';
    }

    return (
      <ListVoteItem id={`vote-${vote.id}`}>
        {/* $FlowFixMe */}
        <UserAvatar user={vote.author} className="pull-left" />
        <div className="opinion__data">
          <p className="h5 opinion__user">
            <UserLink user={vote.author} /> <FormattedMessage id={voteVerbe} />{' '}
            <span className={voteLabelClass}>
              <FormattedMessage id={voteLabel} />
            </span>{' '}
            <FormattedMessage id={voteType} />{' '}
            <span className="excerpt  opinion__date">
              <FormattedDate
                value={moment(vote.createdAt)}
                day="numeric"
                month="long"
                year="numeric"
                hour="numeric"
                minute="numeric"
              />
            </span>
          </p>
        </div>
        <p>
          <a href={vote.related ? vote.related.url : ''}>
            {vote.related && vote.related.title ? (
              vote.related.title
            ) : (
              <Truncate>{vote.related ? vote.related.body : ''}</Truncate>
            )}
          </a>
        </p>
      </ListVoteItem>
    );
  }
}

export default createFragmentContainer(VoteItem, {
  vote: graphql`
    fragment VoteItem_vote on Vote {
      id
      __typename
      createdAt
      ... on OpinionVote {
        value
      }
      ... on VersionVote {
        value
      }
      author {
        id
        slug
        displayName
        url
        vip
        media {
          url
        }
      }
      related {
        id
        url
        kind
        ... on Opinion {
          title
        }
        ... on Version {
          title
        }
        ... on Proposal {
          title
        }
        ... on Source {
          title
        }
        ... on Comment {
          body
        }
        ... on Argument {
          body
        }
      }
    }
  `,
});
