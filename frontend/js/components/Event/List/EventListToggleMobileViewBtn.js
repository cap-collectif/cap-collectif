// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import type { State } from '../../../types';

type Props = {
  isMobileListView: boolean,
  onChange: (isListView: boolean) => void,
};

export class EventListToggleMobileViewBtn extends React.Component<Props> {
  handleClick = (isListView: boolean) => {
    const { onChange, isMobileListView } = this.props;
    if (isListView !== isMobileListView) {
      onChange(isListView);
    }
  };

  render() {
    const { isMobileListView } = this.props;

    return (
      <div
        id="event-view-toggle"
        role="group"
        className="btn-group visible-xs-inline-block visible-sm-inline-block"
        aria-label="Event view">
        <Button
          className="btn-center"
          id="event-view-toggle"
          active={isMobileListView}
          onClick={this.handleClick.bind(this, true)}>
          <i className="cap cap-android-menu" /> <FormattedMessage id='global.list' />
        </Button>
        <Button
          id="event-view-toggle"
          active={!isMobileListView}
          onClick={this.handleClick.bind(this, false)}>
          <i className="cap cap-map-location" /> <FormattedMessage id='capco.module.display_map' />
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  isMobileListView: state.event.isMobileListView,
});

export default connect(mapStateToProps)(EventListToggleMobileViewBtn);
