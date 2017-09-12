import React from 'react';
// import { FormattedDate, FormattedMessage } from 'react-intl';
// import moment from 'moment';
import PinnedLabel from '../Utils/PinnedLabel';
import UserLink from '../User/UserLink';

const CommentInfos = React.createClass({
  propTypes: {
    comment: React.PropTypes.object,
  },

  // renderDate() {
  //   const { comment } = this.props;
  //   if (!Modernizr.intl) {
  //     return null;
  //   }
  //
  //   return (
  //     <span className="excerpt">
  //       <FormattedDate
  //         value={moment(comment.created_at)}
  //         day="numeric"
  //         month="long"
  //         year="numeric"
  //         hour="numeric"
  //         minute="numeric"
  //       />
  //     </span>
  //   );
  // },
  //
  // renderEditionDate() {
  //   const { comment } = this.props;
  //   if (!Modernizr.intl) {
  //     return null;
  //   }
  //
  //   if (moment(comment.updated_at).diff(comment.created_at, 'seconds') <= 1) {
  //     return null;
  //   }
  //
  //   return (
  //     <span className="excerpt">
  //       {' - '}
  //       {<FormattedMessage id="comment.edited" />}{' '}
  //       <FormattedDate
  //         value={moment(comment.updated_at)}
  //         day="numeric"
  //         month="long"
  //         year="numeric"
  //         hour="numeric"
  //         minute="numeric"
  //       />
  //     </span>
  //   );
  // },

  renderAuthorName() {
    const { comment } = this.props;
    if (comment.author) {
      return <UserLink user={comment.author} />;
    }

    return <span>{comment.author_name}</span>;
  },

  render() {
    const { comment } = this.props;
    return (
      <p className="h5  opinion__user">
        {this.renderAuthorName()}
        {'  '}
        {/* {this.renderDate()} */}
        {/* {this.renderEditionDate()} */}
        <PinnedLabel show={comment.pinned} type="comment" />
      </p>
    );
  },
});

export default CommentInfos;
