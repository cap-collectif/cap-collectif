// @flow
import * as React from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';

type Props = {
  eventPageTitle: ?string,
};

export class EventPageHeader extends React.Component<Props> {
  render() {
    const { eventPageTitle } = this.props;
    return (
      <div className="container text-center">
        <h1>
          {eventPageTitle ? (
            <FormattedHTMLMessage id={eventPageTitle} />
          ) : (
            <FormattedMessage id="events-list" />
          )}
        </h1>
      </div>
    );
  }
}

export default EventPageHeader;
