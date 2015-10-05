import UserAvatar from '../User/UserAvatar';
import BrowserSupport from '../../services/BrowserSupport';
import UserLink from '../User/UserLink';
import OpinionArgumentButtons from './OpinionArgumentButtons';
import AutoLinkText from '../Utils/AutoLinkText';

const FormattedDate = ReactIntl.FormattedDate;

const OpinionArgumentItem = React.createClass({
  propTypes: {
    argument: React.PropTypes.object,
    isReportingEnabled: React.PropTypes.bool.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  renderDate() {
    const argument = this.props.argument;
    if (!BrowserSupport.isFormattedDateAvailable()) {
      return null;
    }
    return (
      <p className="excerpt opinion__date">
        <FormattedDate
          value={argument.created_at}
          day="numeric" month="long" year="numeric"
          hour="numeric" minute="numeric"
          />
      </p>
    );
  },

  render() {
    const argument = this.props.argument;
    const classes = classNames({
      'opinion': true,
      'opinion--argument': true,
      'bg-vip': argument.author.vip,
    });
    return (
      <li className={classes} id={'arg-' + argument.id}>
        <div className="opinion__body box">
          <UserAvatar user={argument.author} className="pull-left" />
          <div className="opinion__data">
            <p className="h5 opinion__user">
              <UserLink user={argument.author} />
            </p>
            {this.renderDate()}
          </div>
          <p className="opinion__text">
            <AutoLinkText text={argument.body} />
          </p>
          <OpinionArgumentButtons argument={argument} isReportingEnabled={this.props.isReportingEnabled} />
        </div>
      </li>
    );
  },

});

export default OpinionArgumentItem;
