import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { connect } from 'react-redux';

const EditButton = React.createClass({
  propTypes: {
    author: PropTypes.object,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    editable: PropTypes.bool,
    id: PropTypes.string,
    user: PropTypes.object,
  },

  getDefaultProps() {
    return {
      author: null,
      className: '',
      style: null,
      editable: true,
      id: 'edit-button',
      user: null,
    };
  },

  isEditable() {
    const { editable } = this.props;
    return editable && this.isTheUserTheAuthor();
  },

  isTheUserTheAuthor() {
    const { author, user } = this.props;
    if (author === null || !user) {
      return false;
    }
    return user.uniqueId === author.uniqueId;
  },

  render() {
    const { className, id, onClick, style } = this.props;
    if (this.isEditable()) {
      const classes = {
        btn: true,
        'btn-dark-gray': true,
        'btn--outline': true,
      };

      return (
        <button
          id={id}
          style={style}
          className={classNames(classes, className)}
          onClick={() => onClick()}>
          <i className="cap cap-pencil-1" />
          <FormattedMessage id="global.edit" />
        </button>
      );
    }
    return null;
  },
});

const mapStateToProps = state => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(EditButton);
