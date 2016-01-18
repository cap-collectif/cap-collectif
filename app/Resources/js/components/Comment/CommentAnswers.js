import React from 'react';
import {IntlMixin} from 'react-intl';
import CommentList from './CommentList';

const CommentAnswers = React.createClass({
  propTypes: {
    comments: React.PropTypes.array,
  },
  mixins: [IntlMixin],

  render() {
    if (this.props.comments) {
      return (
        <div>
          <CommentList comments={this.props.comments} root={false}/>
        </div>
      );
    }
    return null;
  },

});

export default CommentAnswers;
