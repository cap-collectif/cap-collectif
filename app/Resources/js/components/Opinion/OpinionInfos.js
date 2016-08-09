import React from 'react';
import moment from 'moment';
import { IntlMixin, FormattedMessage, FormattedDate } from 'react-intl';
import UserLink from '../User/UserLink';

const OpinionInfos = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    rankingThreshold: React.PropTypes.number,
    opinionTerm: React.PropTypes.number,
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
            value={moment(opinion.created_at)}
            day="numeric" month="long" year="numeric"
            hour="numeric" minute="numeric"
        />
      </span>
    );
  },

  renderEditionDate() {
    const { opinion } = this.props;
    if (!Modernizr.intl) {
      return null;
    }

    if (moment(opinion.updated_at).diff(opinion.created_at, 'seconds') <= 1) {
      return null;
    }

    return (
      <span className="excerpt">
        { ' - ' }
        { this.getIntlMessage('global.edited') }
        { ' ' }
        <FormattedDate
          value={moment(opinion.updated_at)}
          day="numeric" month="long" year="numeric"
          hour="numeric" minute="numeric"
        />
      </span>
    );
  },

  renderAuthorName() {
    const { opinion } = this.props;
    if (opinion.author) {
      return <UserLink user={opinion.author} />;
    }

    return <span>{ opinion.author_name }</span>;
  },

  renderRankingLabel() {
    const {
      opinionTerm,
      rankingThreshold,
    } = this.props;
    const opinion = this.props.opinion;
    if (rankingThreshold !== null && opinion.ranking !== null && opinion.ranking <= rankingThreshold) {
      return (
        <span className="opinion__label opinion__label--green">
          <i className="cap cap-trophy"></i>
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
              />
          }
        </span>
      );
    }

    return null;
  },

  render() {
    return (
      <p className="h5 opinion__user">
        { this.renderAuthorName() }
        { ' • ' }
        { this.renderDate() }
        { this.renderEditionDate() }
        { this.renderRankingLabel() }
      </p>
    );
  },

});

export default OpinionInfos;
