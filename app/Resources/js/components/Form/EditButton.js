import React from 'react';
import {IntlMixin} from 'react-intl';
import classNames from 'classnames';
import LoginStore from '../../stores/LoginStore';

const EditButton = React.createClass({
  propTypes: {
    author: React.PropTypes.object,
    onClick: React.PropTypes.func.isRequired,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    editable: React.PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      author: null,
      className: '',
      style: null,
      editable: true,
    };
  },

  isEditable() {
    return this.props.editable && this.isTheUserTheAuthor();
  },

  isTheUserTheAuthor() {
    if (this.props.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.author.uniqueId;
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
          style={this.props.style} className={classNames(classes, this.props.className)}
          onClick={() => this.props.onClick()}
        >
            <i className="cap cap-pencil-1"></i>
          { ' ' + this.getIntlMessage('global.edit')}
          </button>
      );
    }
    return null;
  },

});

export default EditButton;
