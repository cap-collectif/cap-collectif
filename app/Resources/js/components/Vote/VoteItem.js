// @flow
import * as React from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import moment from 'moment';
import { graphql, createFragmentContainer } from 'react-relay';
import { truncate } from 'lodash';
import classNames from 'classnames';
import type { VoteItem_vote } from './__generated__/VoteItem_vote.graphql';
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
    let voteType;
    let voteVerbe;
    let voteLabelClass;
    let voteLabel;

    if (vote.value !== null && vote.value === 1) {
      voteVerbe = 'votes.is';
      voteLabelClass = classNames('label', 'label-success');
      voteLabel = 'votes.value.agree';
    } else if (vote.value !== null && vote.value === -1) {
      voteVerbe = 'votes.isNot';
      voteLabelClass = classNames('label', 'label-danger');
      voteLabel = 'votes.value.disagree';
    } else if (vote.value !== null && vote.value === 0) {
      voteVerbe = 'votes.is';
      voteLabelClass = classNames('label', 'label-warning');
      voteLabel = 'votes.value.mitigated';
    } else {
      voteVerbe = 'votes.has';
      voteLabelClass = classNames('label', 'label-success');
      voteLabel = 'votes.value.voteFor';
    }

    if (vote.kind === 'commentVote') {
      voteType = 'votes.type.commentary';
    } else if (vote.value !== null) {
      voteType = 'votes.type.proposition';
    } else {
      voteType = 'votes.type.propositionVote';
    }

    return (
      <ListVoteItem id={`vote-${vote.id}`}>
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
          {/* $FlowFixMe */}
          <a href={vote.related.url}>
            {/* $FlowFixMe */}
            {vote.related.title
              ? vote.related.title
              : truncate(
                  /* $FlowFixMe */
                  vote.related.body,
                  {
                    length: 50,
                    separator: ' ',
                  },
                )}
          </a>
        </p>
      </ListVoteItem>
    );
  }
}

export default createFragmentContainer(
  VoteItem,
  graphql`
    fragment VoteItem_vote on Vote {
      id
      kind
      value
      createdAt
      author {
        id
        slug
        displayName
        show_url
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
);
