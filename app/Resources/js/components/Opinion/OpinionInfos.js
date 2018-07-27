// @flow
import React from 'react';
import moment from 'moment';
import { FormattedMessage, FormattedDate } from 'react-intl';
import UserLink from '../User/UserLink';
import PinnedLabel from '../Utils/PinnedLabel';

type Props = {
  opinion: Object,
  rankingThreshold?: null | number,
  opinionTerm?: number,
};

class OpinionInfos extends React.Component<Props> {
  isVersion = () => {
    const { opinion } = this.props;
    return !!opinion.parent;
  };

  renderDate = () => {
    const { opinion } = this.props;
    if (!Modernizr.intl) {
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
    if (!Modernizr.intl) {
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

  renderAuthorName = () => {
    const { opinion } = this.props;
    if (opinion.author) {
      return <UserLink user={opinion.author} className="author-name" />;
    }

    return <span className="author-name">{opinion.authorName}</span>;
  };

  renderRankingLabel = () => {
    const { opinion, opinionTerm, rankingThreshold } = this.props;
    if (
      rankingThreshold &&
      rankingThreshold !== null &&
      opinion.ranking !== null &&
      opinion.ranking <= rankingThreshold
    ) {
      return (
        <span className="text-label text-label--green ml-10">
          <i className="cap cap-trophy" />
          {this.isVersion() ? (
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
    return (
      <p>
        {this.renderAuthorName()}
        {this.renderDate()}
        {this.renderEditionDate()}
        <PinnedLabel show={this.props.opinion.pinned || false} type="opinion" />
        {this.renderRankingLabel()}
      </p>
    );
  }
}

export default OpinionInfos;
