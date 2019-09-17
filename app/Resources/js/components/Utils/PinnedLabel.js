// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger } from 'react-bootstrap';
import Tooltip from './Tooltip';

type Props = {
  show: boolean,
  type: string,
};

class PinnedLabel extends React.Component<Props> {
  render() {
    const { show, type } = this.props;
    if (show) {
      return (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip placement="top" className="in" id="pinned-label">
              <FormattedMessage id={`global.pinned.tooltip.${type}`} />
            </Tooltip>
          }>
          <span className="opinion__label opinion__label--blue">
            <i className="cap cap-pin-1" /> <FormattedMessage id="global.pinned.label" />
          </span>
        </OverlayTrigger>
      );
    }
    return null;
  }
}

export default PinnedLabel;
