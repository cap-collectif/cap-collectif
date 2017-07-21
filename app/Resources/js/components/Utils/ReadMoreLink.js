import React from 'react';
import { IntlMixin } from 'react-intl';
import { Button } from 'react-bootstrap';

const ReadMoreLink = React.createClass({
  displayName: 'ReadMoreLink',
  propTypes: {
    visible: React.PropTypes.bool,
    expanded: React.PropTypes.bool,
    onClick: React.PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      visible: false,
      expanded: false,
    };
  },

  render() {
    const {
      expanded,
      onClick,
      visible,
    } = this.props;
    if (!visible) {
      return null;
    }
    return (
      <Button bsStyle="link" className="btn-block" onClick={onClick}>
        {
          expanded
          ? this.getIntlMessage('global.read_less')
          : this.getIntlMessage('global.read_more')
        }
      </Button>
    );
  },

});

export default ReadMoreLink;
