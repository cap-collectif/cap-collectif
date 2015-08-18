import UserAvatar from '../User/UserAvatar';
import UserLink from '../User/UserLink';
import OpinionArgumentButtons from './OpinionArgumentButtons';

const OpinionArgumentItem = React.createClass({
  propTypes: {
    argument: React.PropTypes.object,
    isReportingEnabled: React.PropTypes.bool,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const argument = this.props.argument;
    return (
      <li className="opinion opinion--argument" id={'arg-' + argument.id}>
        <div className="opinion__body box">
          <UserAvatar user={argument.author} />
          <div className="opinion__data">
            <p className="h5 opinion__user">
              <UserLink user={argument.author} />
            </p>
            <p className="excerpt opinion__date">
              {argument.created_at}
            </p>
          </div>
          <p className="opinion__text">
            { argument.body }
          </p>
          <OpinionArgumentButtons argument={argument} />
        </div>
      </li>
    );
  },

});

export default OpinionArgumentItem;
