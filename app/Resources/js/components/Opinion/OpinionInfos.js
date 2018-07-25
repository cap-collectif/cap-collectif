// @flow
import React from 'react';
import moment from 'moment';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, FormattedDate } from 'react-intl';
import UserLink from '../User/UserLink';
import PinnedLabel from '../Utils/PinnedLabel';
import type { OpinionInfos_opinion } from './__generated__/OpinionInfos_opinion.graphql';

type Props = {
  opinion: OpinionInfos_opinion,
  rankingThreshold?: ?number,
  opinionTerm?: number,
};

class OpinionInfos extends React.Component<Props> {
  renderDate = () => {
    const { opinion } = this.props;
    if (!Modernizr.intl || !opinion.createdAt) {
      return null;
    }
    return (
      <span className="excerpt">
        {' • '}
        <FormattedDate
          value={moment(opinion.createdAt).toDate()}
          day="numeric"
          month="long"
          year="numeric"
          hour="numeric"
          minute="numeric"
        />
      </span>
    );
  };

  renderEditionDate = () => {
    const { opinion } = this.props;
    if (!Modernizr.intl || !opinion.updatedAt || !opinion.createdAt) {
      return null;
    }

    if (moment(opinion.updatedAt).diff(opinion.createdAt, 'seconds') <= 1) {
      return null;
    }

    return (
      <span className="excerpt">
        {' - '}
        {<FormattedMessage id="global.edited" />}{' '}
        <FormattedDate
          value={moment(opinion.updatedAt).toDate()}
          day="numeric"
          month="long"
          year="numeric"
          hour="numeric"
          minute="numeric"
        />
      </span>
    );
  };

  renderRankingLabel = () => {
    const { opinion, opinionTerm, rankingThreshold } = this.props;
    if (
      opinion.__typename === 'Opinion' &&
      rankingThreshold &&
      opinion.ranking &&
      Number.isInteger(opinion.ranking) &&
      Number.isInteger(rankingThreshold) &&
      opinion.ranking <= rankingThreshold
    ) {
      return (
        <span className="text-label text-label--green ml-10">
          <i className="cap cap-trophy" />
          {opinion.__typename === 'Version' ? (
            <FormattedMessage
              id="opinion.ranking.versions"
              values={{
                max: rankingThreshold,
              }}
            />
          ) : opinionTerm === 0 ? (
            <FormattedMessage
              id="opinion.ranking.opinions"
              values={{
                max: rankingThreshold,
              }}
            />
          ) : (
            <FormattedMessage
              id="opinion.ranking.articles"
              values={{
                max: rankingThreshold,
              }}
            />
          )}
        </span>
      );
    }

    return null;
  };

  render() {
    const { opinion } = this.props;
    return (
      <p className="opinion__user">
        {opinion.author && <UserLink user={opinion.author} />}
        {this.renderDate()}
        {this.renderEditionDate()}
        <PinnedLabel show={opinion.pinned || false} type="opinion" />
        {this.renderRankingLabel()}
      </p>
    );
  }
}

export default createFragmentContainer(OpinionInfos, {
  opinion: graphql`
    fragment OpinionInfos_opinion on Contribution {
      ... on Opinion {
        __typename
        createdAt
        updatedAt
        pinned
        ranking
        author {
          displayName
          url
        }
      }
      ... on Version {
        __typename
        author {
          displayName
          url
        }
        createdAt
        updatedAt
      }
      ... on Source {
        __typename
        author {
          displayName
          url
        }
        createdAt
        updatedAt
      }
    }
  `,
});
