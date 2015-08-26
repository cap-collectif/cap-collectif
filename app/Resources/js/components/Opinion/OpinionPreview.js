import UserAvatar from '../User/UserAvatar';
import OpinionInfos from './OpinionInfos';

const FormattedMessage = ReactIntl.FormattedMessage;

const OpinionPreview = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const opinion = this.props.opinion;
    return (
      <div className="opinion__body box">
        <UserAvatar user={opinion.author} className="pull-left" />
        <div className="opinion__data">
          <OpinionInfos opinion={opinion} />
          <h3 className="opinion__title">
            <a href={opinion._links.show}>
              { opinion.title }
            </a>
          </h3>
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
