// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect, type MapStateToProps } from 'react-redux';
import { Button } from 'react-bootstrap';
import type { State } from '../../../types';
import config from '../../../config';
import type { ToggleMapButton_step } from './__generated__/ToggleMapButton_step.graphql';

type Props = {
  onChange: Function,
  mode: string,
  step: ToggleMapButton_step,
};

export class ToggleMapButton extends React.Component<Props> {
  handleClick = (chooseMode: $FlowFixMe) => {
    const { onChange, mode } = this.props;
    if (chooseMode && chooseMode !== mode) {
      onChange(chooseMode);
    }
  };

  render() {
    const { mode, step } = this.props;

    return (
      <div
        id="step-view-toggle"
        className="btn-group d-flex"
        style={{ width: '100%' }}
        role="group"
        aria-label="Step view">
        {step.allowingProgressSteps && (
          <Button
            bsStyle="default"
            active={mode === 'table'}
            style={{ flex: '1 0 auto' }}
            onClick={this.handleClick.bind(this, 'table')}>
            <i className="cap cap-android-menu" onClick={this.handleClick.bind(this, 'table')} />{' '}
            {<FormattedMessage id="list-view" />}
          </Button>
        )}
        <Button
          bsStyle="default"
          active={mode === 'mosaic'}
          style={{ flex: '1 0 auto' }}
          onClick={this.handleClick.bind(this, 'mosaic')}>
          <i className="cap cap-th-large" onClick={this.handleClick.bind(this, 'mosaic')} />{' '}
          {<FormattedMessage id="grid" />}
        </Button>
        {!config.isMobile && (
          <Button
            bsStyle="default"
            style={{ flex: '1 0 auto' }}
            active={mode === 'map'}
            onClick={this.handleClick.bind(this, 'map')}>
            <i className="cap cap-map-location" onClick={this.handleClick.bind(this, 'map')} />{' '}
            {<FormattedMessage id="proposal.map.map" />}
          </Button>
        )}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  mode: state.proposal.selectedViewByStep || 'mosaic',
});

const container = connect(mapStateToProps)(ToggleMapButton);

export default createFragmentContainer(container, {
  step: graphql`
    fragment ToggleMapButton_step on ProposalStep {
      id
      ... on SelectionStep {
        allowingProgressSteps
      }
    }
  `,
});
