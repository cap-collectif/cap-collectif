const UserPreview = React.createClass({
  propTypes: {
    user: React.PropTypes.object.isRequired,
  },

  render() {
    return (
      <Col xs={12} sm={6} md={4} lg={4}>
        <div className="media media--macro media--user-thumbnail box block block--bordered">
          <UserAvatar user={user} />
          <div className="media-body">
            <p className="media-heading media--macro__user  small">
              <UserLink user={user} />
            </p>
            <span className="excerpt small">
              <FormattedMessage message="contribution" num={} /> • <FormattedMessage message="votes" num={} />
            </span>
          </div>
        </div>
      </Col>
    );
  },

});

export default UserPreview;
