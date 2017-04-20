import React from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';

const ElementIcon = React.createClass({
  propTypes: {
    element: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return ({
      className: '',
      style: {},
    });
  },

  render() {
    const {
      className,
      element,
      style,
    } = this.props;
    if (element.displayType) {
      const classes = `${classNames({
        cap: true,
        'cap-baloon': element.displayType === 'contribution',
        'cap-folder-2': element.displayType === 'folder',
        'cap-bubble-conversation-5': element.displayType === 'grouping',
        'cap-book-1': element.displayType === 'root',
      })} ${className}`;
      return (
        <i className={classes} style={style}></i>
      );
    }
    return null;
  },

});

export default ElementIcon;
