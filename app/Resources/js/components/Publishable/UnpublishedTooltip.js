// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Overlay, Tooltip } from 'react-bootstrap';
import type { UnpublishedTooltip_publishable } from '~relay/UnpublishedTooltip_publishable.graphql';

type Props = {
  publishable: ?UnpublishedTooltip_publishable,
  target: () => null | Element | Text,
};

export class UnpublishedTooltip extends React.Component<Props> {
  render() {
    const { publishable, target } = this.props;
    return (
      <Overlay
        show={publishable && !publishable.published}
        container={() => document.querySelector('body')}
        target={target}
        placement="top">
        <Tooltip id="UnpublishedTooltip">
          <i className="cap cap-delete-2" />{' '}
          {publishable && publishable.notPublishedReason === 'WAITING_AUTHOR_CONFIRMATION' ? (
            <FormattedMessage id="voting-pending-publication" />
          ) : null}
          {publishable && publishable.notPublishedReason === 'AUTHOR_NOT_CONFIRMED' ? (
            <FormattedMessage id="unpublished-vote" />
          ) : null}
          {publishable && publishable.notPublishedReason === 'AUTHOR_CONFIRMED_TOO_LATE' ? (
            <FormattedMessage id="unpublished-vote" />
          ) : null}
        </Tooltip>
      </Overlay>
    );
  }
}

export default createFragmentContainer(UnpublishedTooltip, {
  publishable: graphql`
    fragment UnpublishedTooltip_publishable on Publishable {
      id
      published
      notPublishedReason
    }
  `,
});
