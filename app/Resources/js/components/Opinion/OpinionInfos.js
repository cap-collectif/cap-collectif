const FormattedDate = ReactIntl.FormattedDate;
const FormattedMessage = ReactIntl.FormattedMessage;

const OpinionInfos = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    rankingThreshold: React.PropTypes.number,
  },
  mixins: [ReactIntl.IntlMixin],

  renderDate() {
    if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
      return <span />;
    }
    return (
      <span className="excerpt">
        <FormattedDate
            value={this.props.opinion.created_at}
            day="numeric" month="long" year="numeric"
            hour="numeric" minute="numeric"
         />
      </span>
    );
  },

  renderEditionDate() {
    if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
      return <span />;
    }

    if (this.props.opinion.updated_at === this.props.opinion.created_at) {
      return <span />;
    }

    return (
      <span className="excerpt">
        { ' - ' }
        { this.getIntlMessage('global.edited') }
        { ' ' }
        <FormattedDate
          value={this.props.opinion.updated_at}
          day="numeric" month="long" year="numeric"
          hour="numeric" minute="numeric"
        />
      </span>
    );
  },

  renderAuthorName() {
    if (this.props.opinion.author) {
      return (
        <a href={this.props.opinion.author._links.profile}>
          { this.props.opinion.author.username }
        </a>
      );
    }

    return <span>{ this.props.opinion.author_name }</span>;
  },

  renderRankingLabel() {
    const opinion = this.props.opinion;
    if (this.props.rankingThreshold !== null && opinion.ranking !== null && opinion.ranking <= this.props.rankingThreshold) {
      return (
        <span className="opinion__label opinion__label--green">
          <i className="cap cap-trophy"></i>
          {this.isVersion()
            ? <FormattedMessage
            message={this.getIntlMessage('opinion.ranking.versions')}
            max={this.props.rankingThreshold}
            />
            : <FormattedMessage
            message={this.getIntlMessage('opinion.ranking.opinions')}
            max={this.props.rankingThreshold}
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

  isVersion() {
    return this.props.opinion.parent ? true : false;
  },

});

export default OpinionInfos;
