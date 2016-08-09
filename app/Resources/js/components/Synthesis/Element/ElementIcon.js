import React from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';

const ElementIcon = React.createClass({
  propTypes: {
    element: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return ({
      className: '',
    });
  },

  render() {
    const {
      className,
      element,
    } = this.props;
    if (element.displayType) {
      const classes = `${classNames({
        cap: true,
        'cap-baloon': element.displayType === 'contribution',
        'cap-folder-2': element.displayType === 'folder',
        'cap-book-1': element.displayType === 'root',
      })} ${className}`;
      return (
        <i className={classes}></i>
      );
    }
    return null;
  },

});

export default ElementIcon;
