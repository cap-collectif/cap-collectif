import React from 'react';
import { IntlMixin, FormattedDate } from 'react-intl';
import moment from 'moment';

const CommentInfos = React.createClass({
  propTypes: {
    comment: React.PropTypes.object,
  },
  mixins: [IntlMixin],

  renderDate() {
    if (!Modernizr.intl) {
      return null;
    }

    return (
      <span className="excerpt">
        <FormattedDate
            value={moment(this.props.comment.created_at)}
            day="numeric" month="long" year="numeric"
            hour="numeric" minute="numeric"
        />
      </span>
    );
  },

  renderEditionDate() {
    if (!Modernizr.intl) {
      return null;
    }

    if (moment(this.props.comment.updated_at).diff(this.props.comment.created_at, 'seconds') <= 1) {
      return null;
    }

    return (
      <span className="excerpt">
        { ' - ' }
        { this.getIntlMessage('comment.edited') }
        { ' ' }
        <FormattedDate
            value={moment(this.props.comment.updated_at)}
            day="numeric" month="long" year="numeric"
            hour="numeric" minute="numeric"
        />
      </span>
    );
  },

  renderAuthorName() {
    if (this.props.comment.author) {
      return (
        <a href={this.props.comment.author._links.profile}>
          { this.props.comment.author.username }
        </a>
      );
    }

    return <span>{ this.props.comment.author_name }</span>;
  },

  render() {
    return (
      <p className="h5  opinion__user">
        { this.renderAuthorName() }
        { '  ' }
        { this.renderDate() }
        { this.renderEditionDate() }
      </p>
    );
  },


});

export default CommentInfos;
