// @flow
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Table } from 'react-bootstrap';
import ProposalFormEvaluationRow from './ProposalFormEvaluationRow';
import type { ProposalFormEvaluationList_proposalForm } from './__generated__/ProposalFormEvaluationList_proposalForm.graphql';

type Props = { proposalForm: ProposalFormEvaluationList_proposalForm };

export class ProposalFormEvaluationList extends Component<Props> {
  render() {
    const { proposalForm } = this.props;
    if (proposalForm.proposals.totalCount === 0) {
      return null;
    }
    return (
      <div className="container">
        <h4>
          {proposalForm.step && proposalForm.step.project.title}{' '}
          <span className="excerpt small">
            <FormattedMessage
              id="proposal.count"
              values={{ num: proposalForm.proposals.totalCount }}
            />
          </span>
        </h4>
        <Table striped hover className="mt-20">
          <thead>
            <tr>
              <th>
                <FormattedMessage id="global.reference" />
              </th>
              <th>
                <FormattedMessage id="global.title" />
              </th>
              <th>
                <FormattedMessage id="project_download.label.status" />
              </th>
              <th>
                <FormattedMessage id="show.label_updated_at" />
              </th>
              <th>
                <FormattedMessage id="admin.fields.project.proposals_table.actions" />
              </th>
            </tr>
          </thead>
          <tbody>
            {proposalForm.proposals.edges &&
              proposalForm.proposals.edges
                .filter(Boolean)
                // $FlowFixMe
                .map(edge => <ProposalFormEvaluationRow key={edge.node.id} proposal={edge.node} />)}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default createFragmentContainer(
  ProposalFormEvaluationList,
  graphql`
    fragment ProposalFormEvaluationList_proposalForm on ProposalForm {
      step {
        title
        project {
          title
        }
      }
      proposals(affiliations: [EVALUER]) {
        totalCount
        edges {
          node {
            id
            ...ProposalFormEvaluationRow_proposal
          }
        }
      }
    }
  `
);
