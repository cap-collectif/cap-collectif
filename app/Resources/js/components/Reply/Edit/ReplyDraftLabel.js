// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Label } from 'react-bootstrap';

type Props = {
  status: string,
};

export default class ReplyDraftLabel extends React.Component<Props> {
  render() {
    return (
<<<<<<< HEAD
      this.props.status === 'DRAFT' && (
        <Label className="badge-pill ml-5" bsStyle="default">
=======
      this.props.draft === 'DRAFT' && (
        <Label className="badge-pill ml-5" bsStyle={'default'}>
>>>>>>> [5673-DRAFT] Remove draft button when already published.
          <FormattedMessage id="proposal.state.draft" />
        </Label>
      )
    );
  }
}
