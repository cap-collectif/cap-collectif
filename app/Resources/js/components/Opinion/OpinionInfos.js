// @flow
import React from 'react';
import moment from 'moment';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, FormattedDate } from 'react-intl';
import UserLink from '../User/UserLink';
import PinnedLabel from '../Utils/PinnedLabel';
import UnpublishedLabel from '../Publishable/UnpublishedLabel';
import type { OpinionInfos_opinion } from './__generated__/OpinionInfos_opinion.graphql';

type Props = {
  opinion: OpinionInfos_opinion,
  showUpdatedDate: boolean,
  rankingThreshold?: ?number,
  opinionTerm?: number,
};

class OpinionInfos extends React.Component<Props> {
  static defaultProps = {
    showUpdatedDate: false,
  };

  renderDate = () => {
    const { opinion } = this.props;
    if (!Modernizr.intl || !opinion.createdAt) {
      return null;
    }
    const date = opinion.publishedAt ? opinion.publishedAt : opinion.createdAt;
    if (!date) {
      return null;
    }

    const sameYear = moment(opinion.publishedAt).isSame(Date.now(), 'year');

    return (
      <span className="excerpt" title={moment(opinion.publishedAt).format('LLL')}>
        {' • '}
        <FormattedDate
          value={moment(opinion.publishedAt).toDate()}
          day="numeric"
          month="short"
          {...(sameYear ? {} : { year: 'numeric' })}
        />
      </span>
    );
  };

  renderEditionDate = () => {
    const { opinion, showUpdatedDate } = this.props;

    if (!showUpdatedDate) {
      return null;
    }

    if (!Modernizr.intl || !opinion.updatedAt) {
      return null;
    }

    if (moment(opinion.updatedAt).diff(opinion.createdAt, 'seconds') <= 1) {
      return null;
    }

    const OpinionUpdatedTooltip = (
      <Tooltip placement="top" id="tooltip-top">
        <FormattedMessage id="opinion-updated-at-the" />{' '}
        <FormattedDate
          value={moment(opinion.updatedAt).toDate()}
          day="numeric"
          hour="2-digit"
          minute="2-digit"
          month="long"
          year="numeric"
        />
      </Tooltip>
    );

    return (
      <span className="excerpt">
        {' • '}
        <OverlayTrigger placement="top" overlay={OpinionUpdatedTooltip}>
          <span>
            <FormattedMessage id="opinion-updated-at" />
          </span>
        </OverlayTrigger>
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
      <div className="opinion__user">
        {opinion.author && <UserLink user={opinion.author} className="author-name" />}
        {this.renderDate()}
        {this.renderEditionDate()}
        <PinnedLabel show={opinion.pinned || false} type="opinion" />
        {this.renderRankingLabel()}
        {/* $FlowFixMe */}
        <UnpublishedLabel publishable={opinion} />
      </div>
    );
  }
}

export default createFragmentContainer(OpinionInfos, {
  opinion: graphql`
    fragment OpinionInfos_opinion on Contribution {
      ...UnpublishedLabel_publishable
      ... on Opinion {
        __typename
        createdAt
        publishedAt
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
        publishedAt
        updatedAt
      }
      ... on Source {
        __typename
        author {
          displayName
          url
        }
        createdAt
        publishedAt
        updatedAt
      }
    }
  `,
});
