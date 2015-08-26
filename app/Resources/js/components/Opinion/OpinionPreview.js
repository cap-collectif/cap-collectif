import UserAvatar from '../User/UserAvatar';
import OpinionInfos from './OpinionInfos';

const FormattedMessage = ReactIntl.FormattedMessage;

const OpinionPreview = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object,
    link: React.PropTypes.bool,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      link: true,
    };
  },

  renderTitle() {
    if (!this.props.link) {
      return (
        <h3 className="opinion__title">
          { this.props.opinion.title }
        </h3>
      );
    }
    return (
      <h3 className="opinion__title">
        <a href={this.props.opinion._links.show}>
          { this.props.opinion.title }
        </a>
      </h3>
    );
  },

  render() {
    const opinion = this.props.opinion;
    return (
      <div className="opinion__body box">
        <UserAvatar user={opinion.author} className="pull-left" />
        <div className="opinion__data">
          <OpinionInfos opinion={opinion} />
          {this.renderTitle()}
          <p className="opinion__votes excerpt small">
            <FormattedMessage message={this.getIntlMessage('global.votes')} num={opinion.votes_total} />
            { ' • ' }
            <FormattedMessage message={this.getIntlMessage('global.arguments')} num={opinion.arguments_count} />
            { ' • ' }
            <FormattedMessage message={this.getIntlMessage('global.sources')} num={opinion.sources_count} />
          </p>
        </div>
      </div>
    );
  },

});

export default OpinionPreview;
