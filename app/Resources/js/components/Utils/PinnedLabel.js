import React from 'react';
import { IntlMixin } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const PinnedLabel = React.createClass({
  propTypes: {
    show: React.PropTypes.bool.isRequired,
    type: React.PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { show, type } = this.props;
    if (show) {
      return (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip placement="top" className="in" id="pinned-label">
              {this.getIntlMessage(`global.pinned.tooltip.${type}`)}
            </Tooltip>
          }>
          <span className="opinion__label opinion__label--blue">
            <i className="cap cap-pin-1" />
            {' '}
            {this.getIntlMessage('global.pinned.label')}
          </span>
        </OverlayTrigger>
      );
    }
    return null;
  },
});

export default PinnedLabel;
