import React from 'react';
import {IntlMixin} from 'react-intl';
import classNames from 'classnames';
import ElementBlock from './ElementBlock';

const ElementListItem = React.createClass({
  propTypes: {
    element: React.PropTypes.object.isRequired,
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
    const classes = classNames({
      'synthesis__list-item': true,
      'box': true,
      'archived': this.props.element.archived,
    });
    return (
      <li className={classes}>
        <ElementBlock
          element={this.props.element}
          showBreadcrumb={this.props.showBreadcrumb}
          showStatus={this.props.showStatus}
          showNotation={this.props.showNotation}
          hasLink={this.props.hasLink}
          linkType={this.props.linkType}
        />
      </li>
    );
  },

});

export default ElementListItem;
