import React from 'react';
import classNames from 'classnames';

class ElementIcon extends React.Component {
  static propTypes = {
    element: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
  };

  static defaultProps = {
    className: '',
    style: {},
  };

  render() {
    const { className, element, style } = this.props;
    if (element.displayType) {
      const classes = `${classNames({
        cap: true,
        'cap-baloon': element.displayType === 'contribution',
        'cap-folder-2': element.displayType === 'folder',
        'cap-bubble-conversation-5': element.displayType === 'grouping',
        'cap-book-1': element.displayType === 'root',
      })} ${className}`;
      return <i className={classes} style={style} />;
    }
    return null;
  }
}

export default ElementIcon;
