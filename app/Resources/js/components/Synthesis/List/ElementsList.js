import React from 'react';
import { Nav } from 'react-bootstrap';
import ElementListItem from './ElementListItem';

const ElementsList = React.createClass({
  propTypes: {
    elements: React.PropTypes.array.isRequired,
    showBreadcrumb: React.PropTypes.bool,
    showStatus: React.PropTypes.bool,
    showNotation: React.PropTypes.bool,
    hasLink: React.PropTypes.bool,
    linkType: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      showBreadcrumb: true,
      showStatus: true,
      showNotation: true,
      hasLink: true,
      linkType: 'edition',
    };
  },

  render() {
    const {
      elements,
      hasLink,
      linkType,
      showBreadcrumb,
      showNotation,
      showStatus,
    } = this.props;
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
  },
});

export default ElementsList;
