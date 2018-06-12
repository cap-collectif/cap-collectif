import React from 'react';
import classNames from 'classnames';
import ElementBlock from './../Element/ElementBlock';

class ElementListItem extends React.Component {
  static propTypes = {
    element: React.PropTypes.object.isRequired,
    showBreadcrumb: React.PropTypes.bool,
    showStatus: React.PropTypes.bool,
    showNotation: React.PropTypes.bool,
    hasLink: React.PropTypes.bool,
    linkType: React.PropTypes.string,
  };

  static defaultProps = {
    showBreadcrumb: true,
    showStatus: true,
    showNotation: true,
    hasLink: true,
    linkType: 'edition',
  };

  render() {
    const { element, hasLink, linkType, showBreadcrumb, showNotation, showStatus } = this.props;
    const classes = classNames({
      'synthesis__list-item': true,
      box: true,
      archived: element.archived,
    });
    return (
      <li className={classes}>
        <ElementBlock
          element={element}
          showBreadcrumb={showBreadcrumb}
          showStatus={showStatus}
          showNotation={showNotation}
          hasLink={hasLink}
          linkType={linkType}
        />
      </li>
    );
  }
}

export default ElementListItem;
