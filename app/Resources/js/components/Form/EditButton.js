import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
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
  mixins: [IntlMixin],

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
    return this.props.editable && this.isTheUserTheAuthor();
  },

  isTheUserTheAuthor() {
    if (this.props.author === null || !this.props.user) {
      return false;
    }
    return this.props.user.uniqueId === this.props.author.uniqueId;
  },

  render() {
    if (this.isEditable()) {
      const classes = {
        'btn': true,
        'btn-dark-gray': true,
        'btn--outline': true,
      };

      return (
        <button
          id={this.props.id}
          style={this.props.style}
          className={classNames(classes, this.props.className)}
          onClick={() => this.props.onClick()}
        >
            <i className="cap cap-pencil-1"></i>
          { ` ${this.getIntlMessage('global.edit')}`}
          </button>
      );
    }
    return null;
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(EditButton);
