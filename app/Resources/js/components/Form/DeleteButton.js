import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import { connect } from 'react-redux';

const DeleteButton = React.createClass({
  propTypes: {
    author: PropTypes.object,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    id: PropTypes.string,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      author: null,
      className: '',
      style: null,
      id: 'delete-button',
      user: null,
    };
  },

  isDeletable() {
    return this.isTheUserTheAuthor();
  },

  isTheUserTheAuthor() {
    const {
      author,
      user,
    } = this.props;
    if (author === null || !user) {
      return false;
    }
    return user.uniqueId === author.uniqueId;
  },

  render() {
    const {
      className,
      id,
      onClick,
      style,
    } = this.props;
    if (this.isDeletable()) {
      const classes = {
        btn: true,
        'btn-danger': true,
        'btn--outline': true,
      };
      classes[className] = true;

      return (
        <button
          id={id}
          style={style} className={classNames(classes)}
          onClick={() => onClick()}
        >
            <i className="cap cap-bin-2"></i>
          { ` ${this.getIntlMessage('global.remove')}`}
          </button>
      );
    }
    return null;
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(DeleteButton);
