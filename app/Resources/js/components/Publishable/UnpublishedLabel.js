// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { OverlayTrigger, Label, Popover } from 'react-bootstrap';
import type { UnpublishedLabel_publishable } from './__generated__/UnpublishedLabel_publishable.graphql';

type Props = {
  publishable: UnpublishedLabel_publishable,
};

export class UnpublishedLabel extends React.Component<Props> {
  render() {
    const { publishable } = this.props;
    if (publishable.published) {
      return null;
    }
    let overlay = null;
    if (publishable.notPublishedReason === 'WAITING_AUTHOR_CONFIRMATION') {
      overlay = (
        <Popover
          id={`publishable-${publishable.id}-not-accounted-popover`}
          title={<FormattedMessage id="account-pending-confirmation" />}>
          <p>
            <FormattedMessage
              id="account-pending-confirmation-message"
              values={{ emailAddress: 'toto@gmail.com', contentType: 'contribution' }}
            />
          </p>
          {publishable.publishableUntil && (
            <p>
              <FormattedMessage
                id="remaining-time"
                values={{
                  remainingTime: moment(publishable.publishableUntil).toNow(true),
                  contentType: 'contribution',
                }}
              />
            </p>
          )}
        </Popover>
      );
    }
    if (publishable.notPublishedReason === 'AUTHOR_NOT_CONFIRMED') {
      overlay = (
        <Popover
          id={`publishable-${publishable.id}-not-accounted-popover`}
          title={<FormattedMessage id="account-not-confirmed-in-time" />}>
          <FormattedMessage id="account-not-confirmed-in-time-message" />
        </Popover>
      );
    }
    if (publishable.notPublishedReason === 'AUTHOR_CONFIRMED_TOO_LATE') {
      overlay = (
        <Popover
          id={`publishable-${publishable.id}-not-accounted-popover`}
          title={<FormattedMessage id="account-confirmed-too-late" />}>
          <FormattedMessage id="account-confirmed-too-late-message" />
        </Popover>
      );
    }

    return (
      <OverlayTrigger placement="top" overlay={overlay}>
        <Label bsStyle="danger">
          <i className="cap cap-delete-2" />{' '}
          <FormattedMessage
            id={
              publishable.notPublishedReason === 'WAITING_AUTHOR_CONFIRMATION'
                ? 'awaiting-publication'
                : 'not-accounted'
            }
          />
        </Label>
      </OverlayTrigger>
    );
  }
}

export default createFragmentContainer(UnpublishedLabel, {
  publishable: graphql`
    fragment UnpublishedLabel_publishable on Publishable {
      id
      published
      notPublishedReason
      publishableUntil
    }
  `,
});
