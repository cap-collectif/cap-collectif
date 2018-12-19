// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import type { State } from '../../../types';
import config from '../../../config';

type Props = {
  onChange: Function,
  mode?: 'mosaic' | 'map' | 'table',
  showMapButton: boolean,
};

export class ProposalListToggleViewBtn extends React.Component<Props> {
  handleClick = (chooseMode: $FlowFixMe) => {
    const { onChange, mode } = this.props;
    if (chooseMode && chooseMode !== mode) {
      onChange(chooseMode);
    }
  };

  render() {
    const { mode, showMapButton } = this.props;

    return (
      <div
        id="step-view-toggle"
        className="btn-group d-flex mb-15"
        style={{ width: '100%' }}
        role="group"
        aria-label="Step view">
        <Button
          bsStyle="default"
          active={mode === 'table'}
          style={{ flex: '1 0 auto' }}
          onClick={this.handleClick.bind(this, 'table')}>
          <i className="cap cap-android-menu" /> <FormattedMessage id="list-view" />
        </Button>
        <Button
          bsStyle="default"
          active={mode === 'mosaic'}
          style={{ flex: '1 0 auto' }}
          onClick={this.handleClick.bind(this, 'mosaic')}>
          <i className="cap cap-th-large" /> <FormattedMessage id="grid" />
        </Button>
        {!config.isMobile && showMapButton && (
          <Button
            bsStyle="default"
            style={{ flex: '1 0 auto' }}
            active={mode === 'map'}
            onClick={this.handleClick.bind(this, 'map')}>
            <i className="cap cap-map-location" /> <FormattedMessage id="proposal.map.map" />
          </Button>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  mode: state.proposal.selectedViewByStep || 'mosaic',
});

export default connect(mapStateToProps)(ProposalListToggleViewBtn);
