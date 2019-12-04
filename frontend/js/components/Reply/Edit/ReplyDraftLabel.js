// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Label } from 'react-bootstrap';

type Props = {
  draft: boolean,
};

export default class ReplyDraftLabel extends React.Component<Props> {
  render() {
    const { draft } = this.props;
    return draft ? (
      <Label className="badge-pill ml-5" bsStyle="default">
        <FormattedMessage id="proposal.state.draft" />
      </Label>
    ) : null;
  }
}
