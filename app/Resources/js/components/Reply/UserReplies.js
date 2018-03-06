import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ListGroup } from 'react-bootstrap';
import ReplyModalLink from './Show/ReplyModalLink';

const UserReplies = React.createClass({
  propTypes: {
    replies: React.PropTypes.array.isRequired,
    form: React.PropTypes.object.isRequired
  },

  render() {
    const { replies, form } = this.props;
    if (replies.length === 0) {
      return null;
    }

    return (
      <div id="user-replies" className="block">
        <h3 className="h4">
          <FormattedMessage
            id="reply.show.title"
            values={{
              num: replies.length
            }}
          />
        </h3>
        <ListGroup>
          {replies.map((reply, index) => {
            return <ReplyModalLink key={index} reply={reply} form={form} />;
          })}
        </ListGroup>
        <hr />
      </div>
    );
  }
});

export default UserReplies;
