import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';

const ReadMoreLink = React.createClass({
  displayName: 'ReadMoreLink',

  propTypes: {
    visible: React.PropTypes.bool,
    expanded: React.PropTypes.bool,
    onClick: React.PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      visible: false,
      expanded: false
    };
  },

  render() {
    const { expanded, onClick, visible } = this.props;
    if (!visible) {
      return null;
    }
    return (
      <Button bsStyle="link" className="btn-block" onClick={onClick}>
        {expanded ? (
          <FormattedMessage id="global.read_less" />
        ) : (
          <FormattedMessage id="global.read_more" />
        )}
      </Button>
    );
  }
});

export default ReadMoreLink;
