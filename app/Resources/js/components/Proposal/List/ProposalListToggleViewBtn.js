// @flow
import React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import type { State } from '../../../types';
import config from '../../../config';
import type { ProposalViewMode } from '../../../redux/modules/proposal';

type Props = {
  onChange: Function,
  mode?: ProposalViewMode,
  showMapButton: boolean,
  intl: IntlShape,
};

export class ProposalListToggleViewBtn extends React.Component<Props> {
  handleClick = (chooseMode: $FlowFixMe) => {
    const { onChange, mode } = this.props;
    if (chooseMode && chooseMode !== mode) {
      onChange(chooseMode);
    }
  };

  render() {
    const { mode, showMapButton, intl } = this.props;

    return (
      <div
        id="step-view-toggle"
        className="btn-group d-flex mb-15"
        style={{ width: '100%' }}
        role="group"
        aria-label={intl.formatMessage({ id: 'global.filter.chose.display.type' })}>
        <Button
          bsStyle="default"
          active={mode === 'table'}
          role="checkbox"
          aria-checked={mode === 'table'}
          title={mode === 'table' ? intl.formatMessage({ id: 'table-selected' }) : null}
          style={{ flex: '1 0 auto' }}
          onClick={this.handleClick.bind(this, 'table')}>
          <i className="cap cap-android-menu" /> <FormattedMessage id="list-view" />
        </Button>
        <Button
          bsStyle="default"
          active={mode === 'mosaic'}
          role="checkbox"
          aria-checked={mode === 'mosaic'}
          title={mode === 'mosaic' ? intl.formatMessage({ id: 'mosaic-selected' }) : null}
          style={{ flex: '1 0 auto' }}
          onClick={this.handleClick.bind(this, 'mosaic')}>
          <i className="cap cap-th-large" /> <FormattedMessage id="grid" />
        </Button>
        {!config.isMobile && showMapButton && (
          <Button
            bsStyle="default"
            style={{ flex: '1 0 auto' }}
            role="checkbox"
            aria-checked={mode === 'map'}
            title={mode === 'map' ? intl.formatMessage({ id: 'map-selected' }) : null}
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

export default connect(mapStateToProps)(injectIntl(ProposalListToggleViewBtn));
