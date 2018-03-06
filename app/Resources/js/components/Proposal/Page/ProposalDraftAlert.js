// @flow
import React from 'react';
import { Alert } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

type Props = {
  proposal: { isDraft: boolean }
};

export default class ProposalDraftAlert extends React.Component<Props> {
  render() {
    const proposal = this.props.proposal;
    if (proposal.isDraft) {
      return (
        <Alert bsStyle="warning" style={{ marginBottom: '0', textAlign: 'center' }}>
          <strong>
            <FormattedMessage id="proposal.draft.is_draft" />
          </strong>
          <span>
            {' '}
            <FormattedMessage id="proposal.draft.explain" />
          </span>
        </Alert>
      );
    }

    return null;
  }
}
