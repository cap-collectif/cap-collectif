import React from 'react';
import { IntlMixin } from 'react-intl';
import ReplyModalLink from './Show/ReplyModalLink';

const UserReplies = React.createClass({
  propTypes: {
    replies: React.PropTypes.array.isRequired,
    form: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { replies, form } = this.props;
    if (replies.length === 0) {
      return null;
    }

    return (
      <div id="user-replies" className="block">
        {
          replies.length > 1
          ? <h3>{this.getIntlMessage('reply.show.title')}</h3>
          : null
        }
        {
          replies.map((reply, index) => {
            return (
              <ReplyModalLink key={index} reply={reply} form={form} label={replies.length === 1 ? this.getIntlMessage('reply.show.one_link') : null} />
            );
          })
        }
      </div>
    );
  },

});

export default UserReplies;
