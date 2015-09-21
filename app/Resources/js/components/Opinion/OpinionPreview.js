import {COMMENT_SYSTEM_NONE} from '../../constants/ArgumentConstants';
import {VOTE_WIDGET_DISABLED} from '../../constants/VoteConstants';

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

  getType() {
    const opinion = this.props.opinion;
    if (opinion.parent) {
      return opinion.parent.type;
    }
    return opinion.type;
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

  renderCounters() {
    const opinion = this.props.opinion;
    const type = this.getType();
    const counters = [];
    if (type.voteWidgetType !== VOTE_WIDGET_DISABLED) {
      counters.push(<FormattedMessage message={this.getIntlMessage('global.votes')} num={opinion.votes_total}/>);
    }
    if (type.commentSystem !== COMMENT_SYSTEM_NONE) {
      counters.push(<FormattedMessage message={this.getIntlMessage('global.arguments')} num={opinion.arguments_count} />);
    }
    if (!opinion.parent && type.versionable) {
      counters.push(<FormattedMessage message={this.getIntlMessage('global.versions')} num={opinion.versions_count}/>);
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

  render() {
    const opinion = this.props.opinion;
    const classes = classNames({
      'opinion__body': true,
      'box': true,
    });
    return (
      <div className={classes} >
        <UserAvatar user={opinion.author} className="pull-left" />
        <div className="opinion__data">
          <OpinionInfos opinion={opinion} />
          {this.renderTitle()}
          {this.renderCounters()}
        </div>
      </div>
    );
  },

});

export default OpinionPreview;
