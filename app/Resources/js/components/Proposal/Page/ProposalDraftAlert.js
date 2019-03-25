// @flow
import React from 'react';
import { Alert } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import type { ProposalDraftAlert_proposal } from './__generated__/ProposalDraftAlert_proposal.graphql';

type Props = {
  proposal: ProposalDraftAlert_proposal,
};

export class ProposalDraftAlert extends React.Component<Props> {
  render() {
    const proposal = this.props.proposal;
    if (proposal.publicationStatus === 'DRAFT') {
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

export default createFragmentContainer(ProposalDraftAlert, {
  proposal: graphql`
    fragment ProposalDraftAlert_proposal on Proposal {
      publicationStatus
    }
  `,
});
