import UserAvatar from '../User/UserAvatar';
import LoginStore from '../../stores/LoginStore';

const OpinionVersion = React.createClass({
  propTypes: {
    version: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {};
  },

  render() {
    const version = this.props.version;
    return (
      <li className="opinion  opinion--comment" >
        <div className="opinion__body">
          <UserAvatar user={version.author} />
            <p>
              { version.body }
            </p>
        </div>
      </li>
    );
  },

  // isTheUserTheAuthor() {
  //   if (this.props.comment.author === null || !LoginStore.isLoggedIn()) {
  //     return false;
  //   }
  //   return LoginStore.user.unique_id === this.props.comment.author.unique_id;
  // },

});

export default OpinionVersion;
