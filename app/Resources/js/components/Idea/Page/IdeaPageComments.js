import React from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import CommentSection from '../../Comment/CommentSection';

const IdeaPageComments = React.createClass({
  propTypes: {
    id: React.PropTypes.number.isRequired,
    className: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
    };
  },

  render() {
    const classes = {
      'idea__comments': true,
      [this.props.className]: true,
    };
    return (
      <div className={classNames(classes)}>
        <CommentSection
          uri="ideas"
          object={this.props.id}
        />
      </div>
    );
  },

});

export default IdeaPageComments;
