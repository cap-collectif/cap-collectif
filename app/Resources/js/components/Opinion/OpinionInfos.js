// @flow
import React, { PropTypes } from 'react';
import moment from 'moment';
import { IntlMixin, FormattedMessage, FormattedDate } from 'react-intl';
import UserLink from '../User/UserLink';
import PinnedLabel from '../Utils/PinnedLabel';

const OpinionInfos = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
    rankingThreshold: PropTypes.oneOfType([
      PropTypes.oneOf([null]),
      PropTypes.number,
    ]),
    opinionTerm: PropTypes.number,
  },
  mixins: [IntlMixin],

  isVersion() {
    const { opinion } = this.props;
    return !!opinion.parent;
  },

  renderDate() {
    const { opinion } = this.props;
    if (!Modernizr.intl) {
      return null;
    }
    return (
      <span className="excerpt">
        <FormattedDate
          value={moment(opinion.createdAt)}
          day="numeric"
          month="long"
          year="numeric"
          hour="numeric"
          minute="numeric"
        />
      </span>
    );
  },

  renderEditionDate() {
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
        {this.getIntlMessage('global.edited')}{' '}
        <FormattedDate
          value={moment(opinion.updatedAt)}
          day="numeric"
          month="long"
          year="numeric"
          hour="numeric"
          minute="numeric"
        />
      </span>
    );
  },

  renderAuthorName() {
    const { opinion } = this.props;
    if (opinion.author) {
      return <UserLink user={opinion.author} />;
    }

    return (
      <span>
        {opinion.author_name}
      </span>
    );
  },

  renderRankingLabel() {
    const { opinion, opinionTerm, rankingThreshold } = this.props;
    if (
      rankingThreshold &&
      rankingThreshold !== null &&
      opinion.ranking !== null &&
      opinion.ranking <= rankingThreshold
    ) {
      return (
        <span className="opinion__label opinion__label--green">
          <i className="cap cap-trophy" />
          {this.isVersion()
            ? <FormattedMessage
                message={this.getIntlMessage('opinion.ranking.versions')}
                max={rankingThreshold}
              />
            : opinionTerm === 0
              ? <FormattedMessage
                  message={this.getIntlMessage('opinion.ranking.opinions')}
                  max={rankingThreshold}
                />
              : <FormattedMessage
                  message={this.getIntlMessage('opinion.ranking.articles')}
                  max={rankingThreshold}
                />}
        </span>
      );
    }

    return null;
  },

  render() {
    return (
      <p className="opinion__user">
        {this.renderAuthorName()}
        {' • '}
        {this.renderDate()}
        {this.renderEditionDate()}
        <PinnedLabel show={this.props.opinion.pinned || false} type="opinion" />
        {this.renderRankingLabel()}
      </p>
    );
  },
});

export default OpinionInfos;
