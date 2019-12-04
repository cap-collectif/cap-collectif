// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import ProposalCollectStatus from '../Proposal/ProposalCollectStatus';
import ProposalLastUpdateInfo from '../Proposal/ProposalLastUpdateInfo';
import type { ProposalFormEvaluationRow_proposal } from '~relay/ProposalFormEvaluationRow_proposal.graphql';

type Props = { proposal: ProposalFormEvaluationRow_proposal };

export class ProposalFormEvaluationRow extends React.Component<Props> {
  render() {
    const { proposal } = this.props;
    return (
      <tr>
        <td>{proposal.reference}</td>
        <td>
          <a href={proposal.url}>{proposal.title}</a>
        </td>
        <td>
          <ProposalCollectStatus proposal={proposal} />
        </td>
        <td>
          <ProposalLastUpdateInfo proposal={proposal} />
        </td>
        <td>
          <ButtonToolbar>
            <Button href={proposal.url}>
              <FormattedMessage id="global.see" />
            </Button>
            <Button bsStyle="primary" href={`${proposal.url}#evaluation`}>
              <FormattedMessage id="global.eval" />
            </Button>
          </ButtonToolbar>
        </td>
      </tr>
    );
  }
}

export default createFragmentContainer(ProposalFormEvaluationRow, {
  proposal: graphql`
    fragment ProposalFormEvaluationRow_proposal on Proposal {
      url
      reference
      title
      ...ProposalCollectStatus_proposal
      ...ProposalLastUpdateInfo_proposal
    }
  `,
});
