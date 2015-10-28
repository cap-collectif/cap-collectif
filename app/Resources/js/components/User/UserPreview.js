import UserAvatar from '../User/UserAvatar';
import UserLink from '../User/UserLink';

const Col = ReactBootstrap.Col;
const FormattedMessage = ReactIntl.FormattedMessage;

const UserPreview = React.createClass({
  propTypes: {
    user: React.PropTypes.object.isRequired,
  },

  render() {
    const user = this.props.user;
    return (
      <Col xs={12} sm={6} md={4} lg={4}>
        <div className="media media--macro media--user-thumbnail box block block--bordered">
          <UserAvatar user={user} />
          <div className="media-body">
            <p className="media-heading media--macro__user  small">
              <UserLink user={user} />
            </p>
            <span className="excerpt small">
              <FormattedMessage message="contribution" num={1} /> • <FormattedMessage message="votes" num={1} />
            </span>
          </div>
        </div>
      </Col>
    );
  },

});

export default UserPreview;
