// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import type { State } from '../../../types';

export const ToggleMapButton = React.createClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  handleClick(chooseMode) {
    const { onChange, mode } = this.props;
    if (chooseMode && chooseMode !== mode) {
      onChange(chooseMode);
    }
  },

  render() {
    const { mode } = this.props;

    return (
      <div
        id="step-view-toggle"
        className="btn-group"
        style={{ width: '100%' }}
        role="group"
        aria-label="Step view">
        <Button
          bsStyle="default"
          active={mode === 'mosaic'}
          style={{ width: '50%' }}
          onClick={this.handleClick.bind(this, 'mosaic')}>
          <i
            className="cap cap-th-large"
            onClick={this.handleClick.bind(this, 'mosaic')}
          />
          {' '}
          {this.getIntlMessage('proposal.map.mosaic')}
        </Button>
        <Button
          bsStyle="default"
          active={mode === 'map'}
          style={{ width: '50%' }}
          onClick={this.handleClick.bind(this, 'map')}>
          <i
            className="cap cap-map-location"
            onClick={this.handleClick.bind(this, 'map')}
          />
          {' '}
          {this.getIntlMessage('proposal.map.map')}
        </Button>
      </div>
    );
  },
});

const mapStateToProps = (state: State) => ({
  mode: state.proposal.selectedViewByStep || 'mosaic',
});

export default connect(mapStateToProps)(ToggleMapButton);
