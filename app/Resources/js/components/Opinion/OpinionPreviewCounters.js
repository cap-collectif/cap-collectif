import {COMMENT_SYSTEM_NONE} from '../../constants/ArgumentConstants';
import {VOTE_WIDGET_DISABLED} from '../../constants/VoteConstants';

const FormattedMessage = ReactIntl.FormattedMessage;

const OpinionPreviewCounters = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getType() {
    const opinion = this.props.opinion;
    if (opinion.parent) {
      return opinion.parent.type;
    }
    return opinion.type;
  },

  render() {
    const opinion = this.props.opinion;
    const type = this.getType();
    const counters = [];
    if (type.voteWidgetType !== VOTE_WIDGET_DISABLED) {
      counters.push(<FormattedMessage message={this.getIntlMessage('global.votes')} num={opinion.votes_total}/>);
    }
    if (!opinion.parent && type.versionable) {
      counters.push(<FormattedMessage message={this.getIntlMessage('global.versions')} num={opinion.versions_count}/>);
    }
    if (type.commentSystem !== COMMENT_SYSTEM_NONE) {
      counters.push(<FormattedMessage message={this.getIntlMessage('global.arguments')} num={opinion.arguments_count} />);
    }
    if (type.sourceable) {
      counters.push(<FormattedMessage message={this.getIntlMessage('global.sources')} num={opinion.sources_count} />);
    }
    return (
      <p className="opinion__votes excerpt small">
        {
          counters.map( (counter, index) => {
            if (index < (counters.length - 1)) {
              return <span>{counter}<span> • </span></span>;
            }
            return counter;
          })
        }
      </p>
    );
  },

});

export default OpinionPreviewCounters;
