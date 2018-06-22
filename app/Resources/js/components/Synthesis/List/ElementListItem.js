import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ElementBlock from './../Element/ElementBlock';

class ElementListItem extends React.Component {
  static propTypes = {
    element: PropTypes.object.isRequired,
    showBreadcrumb: PropTypes.bool,
    showStatus: PropTypes.bool,
    showNotation: PropTypes.bool,
    hasLink: PropTypes.bool,
    linkType: PropTypes.string,
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
