import React from 'react';
import classNames from 'classnames';

type Props = {
  element: Object,
  className: string,
  style: Object,
};

class ElementIcon extends React.Component<Props> {
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
