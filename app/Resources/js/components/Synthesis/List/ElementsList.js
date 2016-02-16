import React from 'react';
import { IntlMixin } from 'react-intl';
import ElementListItem from './ElementListItem';
import { Nav } from 'react-bootstrap';

const ElementsList = React.createClass({
  propTypes: {
    elements: React.PropTypes.array.isRequired,
    showBreadcrumb: React.PropTypes.bool,
    showStatus: React.PropTypes.bool,
    showNotation: React.PropTypes.bool,
    hasLink: React.PropTypes.bool,
    linkType: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return ({
      showBreadcrumb: true,
      showStatus: true,
      showNotation: true,
      hasLink: true,
      linkType: 'edition',
    });
  },

  render() {
    if (this.props.elements.length < 1) {
      return null;
    }

    return (
      <Nav stacked className="synthesis__list">
        {
          this.props.elements.map((element) => {
            return (
              <ElementListItem
                key={element.id}
                element={element}
                showBreadcrumb={this.props.showBreadcrumb}
                showStatus={this.props.showStatus}
                showNotation={this.props.showNotation}
                hasLink={this.props.hasLink}
                linkType={this.props.linkType}
              />
            );
          })
        }
      </Nav>
    );
  },

});

export default ElementsList;
