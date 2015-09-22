const FormattedDate = ReactIntl.FormattedDate;

const OpinionInfos = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
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

  render() {
    return (
      <p className="h5 opinion__user">
        { this.renderAuthorName() }
        { ' • ' }
        { this.renderDate() }
        { this.renderEditionDate() }
      </p>
    );
  },

});

export default OpinionInfos;
