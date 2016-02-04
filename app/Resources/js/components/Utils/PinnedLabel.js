import React from 'react';
import {IntlMixin} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

const PinnedLabel = React.createClass({
  propTypes: {
    show: React.PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    if (this.props.show) {
      return (
      <OverlayTrigger
        placement="top"
        overlay={
            <Tooltip placement="top" className="in">
              {this.getIntlMessage('global.pinned.tooltip')}
            </Tooltip>
          }
      >
        <span className="opinion__label opinion__label--blue">
          <i className="cap cap-pin-1"></i> {this.getIntlMessage('global.pinned.label')}
        </span>
      </OverlayTrigger>
      );
    }
    return null;
  },

});

export default PinnedLabel;
