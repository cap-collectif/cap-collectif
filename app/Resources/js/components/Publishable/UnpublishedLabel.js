// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { OverlayTrigger, Label, Popover } from 'react-bootstrap';
import type { UnpublishedLabel_publishable } from '~relay/UnpublishedLabel_publishable.graphql';
import type { GlobalState } from '../../types';

type Props = {
  publishable: UnpublishedLabel_publishable,
  viewer: { email: string },
};

export class UnpublishedLabel extends React.Component<Props> {
  render() {
    const { publishable, viewer } = this.props;
    if (publishable.published) {
      return null;
    }
    let overlay = null;
    if (publishable.notPublishedReason === 'WAITING_AUTHOR_CONFIRMATION') {
      overlay = (
        <Popover
          id={`publishable-${publishable.id}-not-accounted-popover`}
          title={
            <strong>
              <FormattedMessage id="account-pending-confirmation" />
            </strong>
          }>
          <p>
            <FormattedMessage
              id="account-pending-confirmation-message"
              values={{ contentType: 'contribution', emailAddress: viewer.email }}
            />
          </p>
          {publishable.publishableUntil && (
            <p>
              <strong>
                <FormattedMessage
                  id="remaining-time"
                  values={{
                    remainingTime: moment(publishable.publishableUntil).toNow(true),
                    contentType: 'contribution',
                  }}
                />
              </strong>
            </p>
          )}
        </Popover>
      );
    }
    if (publishable.notPublishedReason === 'AUTHOR_NOT_CONFIRMED') {
      overlay = (
        <Popover
          id={`publishable-${publishable.id}-not-accounted-popover`}
          title={
            <strong>
              <FormattedMessage id="account-not-confirmed-in-time" />
            </strong>
          }>
          <FormattedMessage id="account-not-confirmed-in-time-message" />
        </Popover>
      );
    }
    if (publishable.notPublishedReason === 'AUTHOR_CONFIRMED_TOO_LATE') {
      overlay = (
        <Popover
          id={`publishable-${publishable.id}-not-accounted-popover`}
          title={
            <strong>
              <FormattedMessage id="account-confirmed-too-late" />
            </strong>
          }>
          <FormattedMessage id="account-confirmed-too-late-message" />
        </Popover>
      );
    }

    return (
      <React.Fragment>
        {' '}
        <OverlayTrigger placement="top" overlay={overlay}>
          <Label bsStyle="danger" className="ellipsis d-ib mw-100 mt-5">
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
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  viewer: state.user.user,
});

const container = connect(mapStateToProps)(UnpublishedLabel);

export default createFragmentContainer(container, {
  publishable: graphql`
    fragment UnpublishedLabel_publishable on Publishable {
      id
      published
      notPublishedReason
      publishableUntil
    }
  `,
});
