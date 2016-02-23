import React from 'react';
import { IntlMixin } from 'react-intl';
import { Button } from 'react-bootstrap';

const ReadMoreLink = React.createClass({
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
    if (!this.props.visible) {
      return null;
    }
    const { expanded } = this.props;
    return (
      <Button bsStyle="link" onClick={this.props.onClick}>
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
