// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import type { ProposalFormEvaluationRow_proposal } from './__generated__/ProposalFormEvaluationRow_proposal.graphql';

type Props = { proposal: ProposalFormEvaluationRow_proposal };

export class ProposalFormEvaluationRow extends React.Component<Props> {
  render() {
    const { proposal } = this.props;
    return (
      <tr>
        <td>{proposal.reference}</td>
        <td>{proposal.title}</td>
        <td>{proposal.status && proposal.status.name}</td>
        <td>{proposal.updatedAt}</td>
        <td>
          <ButtonToolbar>
            <Button href={proposal.show_url}>
              <FormattedMessage id="global.see" />
            </Button>
            <Button bStyle="primary" href={`${proposal.show_url}#evaluation`}>
              <FormattedMessage id="global.eval" />
            </Button>
          </ButtonToolbar>
        </td>
      </tr>
    );
  }
}

export default createFragmentContainer(
  ProposalFormEvaluationRow,
  graphql`
    fragment ProposalFormEvaluationRow_proposal on Proposal {
      show_url
      reference
      title
      updatedAt
      status {
        name
        id
      }
    }
  `,
);
