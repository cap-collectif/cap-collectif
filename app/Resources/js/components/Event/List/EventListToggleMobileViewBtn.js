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
      <div id="event-view-toggle" role="group" className="btn-group ml-10" aria-label="Event view">
        <Button
          className="btn--outline btn-dark-gray btn-center flex-1"
          id="event-view-toggle"
          active={isMobileListView}
          onClick={this.handleClick.bind(this, true)}>
          <i className="cap cap-android-menu" /> <FormattedMessage id="list-view" />
        </Button>
        <Button
          id="event-view-toggle"
          className="btn--outline btn-dark-gray flex-1"
          active={!isMobileListView}
          onClick={this.handleClick.bind(this, false)}>
          <i className="cap cap-map-location" /> <FormattedMessage id="proposal.map.map" />
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  isMobileListView: state.event.isMobileListView,
});

export default connect(mapStateToProps)(EventListToggleMobileViewBtn);
