// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { Button } from 'react-bootstrap';
import type { State } from '../../../types';

type Props = {
  onChange: Function,
  mode: string,
};

export class ToggleMapButton extends React.Component<Props> {
  handleClick = (chooseMode: $FlowFixMe) => {
    const { onChange, mode } = this.props;
    if (chooseMode && chooseMode !== mode) {
      onChange(chooseMode);
    }
  };

  render() {
    const { mode } = this.props;

    return (
      <div
        id="step-view-toggle"
        className="btn-group d-flex"
        style={{ width: '100%' }}
        role="group"
        aria-label="Step view">
        <Button
          bsStyle="default"
          active={mode === 'table'}
          onClick={this.handleClick.bind(this, 'table')}>
          <i className="cap cap-android-menu" onClick={this.handleClick.bind(this, 'table')} />{' '}
          {<FormattedMessage id="list-view" />}
        </Button>
        <Button
          bsStyle="default"
          active={mode === 'mosaic'}
          style={{ flex: '1 0 auto' }}
          onClick={this.handleClick.bind(this, 'mosaic')}>
          <i className="cap cap-th-large" onClick={this.handleClick.bind(this, 'mosaic')} />{' '}
          {<FormattedMessage id="proposal.map.mosaic" />}
        </Button>
        <Button
          bsStyle="default"
          active={mode === 'map'}
          onClick={this.handleClick.bind(this, 'map')}>
          <i className="cap cap-map-location" onClick={this.handleClick.bind(this, 'map')} />{' '}
          {<FormattedMessage id="proposal.map.map" />}
        </Button>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  mode: state.proposal.selectedViewByStep || 'mosaic',
});

export default connect(mapStateToProps)(ToggleMapButton);
