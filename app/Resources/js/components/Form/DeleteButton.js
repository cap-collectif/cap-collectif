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
    if (this.props.author === null || !this.props.user) {
      return false;
    }
    return this.props.user.uniqueId === this.props.author.uniqueId;
  },

  render() {
    if (this.isDeletable()) {
      const classes = {
        'btn': true,
        'btn-danger': true,
        'btn--outline': true,
      };
      classes[this.props.className] = true;

      return (
        <button
          id={this.props.id}
          style={this.props.style} className={classNames(classes)}
          onClick={() => this.props.onClick()}
        >
            <i className="cap cap-bin-2"></i>
          { ' ' + this.getIntlMessage('global.remove')}
          </button>
      );
    }
    return null;
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(DeleteButton);
