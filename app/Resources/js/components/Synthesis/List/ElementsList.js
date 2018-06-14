import React from 'react';
import PropTypes from 'prop-types';
import { Nav } from 'react-bootstrap';
import ElementListItem from './ElementListItem';

class ElementsList extends React.Component {
  static propTypes = {
    elements: PropTypes.array.isRequired,
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
    const { elements, hasLink, linkType, showBreadcrumb, showNotation, showStatus } = this.props;
    if (elements.length < 1) {
      return null;
    }

    return (
      <Nav stacked className="synthesis__list">
        {elements.map(element => {
          return (
            <ElementListItem
              key={element.id}
              element={element}
              showBreadcrumb={showBreadcrumb}
              showStatus={showStatus}
              showNotation={showNotation}
              hasLink={hasLink}
              linkType={linkType}
            />
          );
        })}
      </Nav>
    );
  }
}

export default ElementsList;
