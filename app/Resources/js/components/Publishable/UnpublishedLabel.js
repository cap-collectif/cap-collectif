// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Glyphicon, Label, Popover } from 'react-bootstrap';
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
    const overlay = (
      <Popover
        id={`publishable-${publishable.id}-not-accounted-popover`}
        title={publishable.notPublishedReason}>
        {publishable.notPublishedReason}
      </Popover>
    );

    return (
      <OverlayTrigger placement="top" overlay={overlay}>
        <Label bsStyle="danger">
          <Glyphicon glyph="star" />
          <FormattedMessage id="not-accounted" />
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
    }
  `,
});
