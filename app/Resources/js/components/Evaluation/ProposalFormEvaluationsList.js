// @flow
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Table, ButtonToolbar, Button } from 'react-bootstrap';
import type { ProposalFormEvaluationsList_proposalForm } from './__generated__/ProposalFormEvaluationsList_proposalForm.graphql';

type Props = { proposalForm: ProposalFormEvaluationsList_proposalForm };

export class ProposalFormEvaluationsList extends Component<Props> {
  render() {
    const { proposalForm } = this.props;
    if (proposalForm.proposals.totalCount === 0) {
      return null;
    }
    return (
      <div>
        <h4>{proposalForm.step && proposalForm.step.project.title}</h4>
        <Table striped bordered condensed hover>
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
              proposalForm.proposals.edges.filter(Boolean).map(edge => (
                <tr key={edge.node.id}>
                  <td>{edge.node.reference}</td>
                  <td>{edge.node.title}</td>
                  <td>{edge.node.status && edge.node.status.name}</td>
                  <td>{edge.node.updatedAt}</td>
                  <td>
                    <ButtonToolbar>
                      <Button href={edge.node.show_url}>
                        <FormattedMessage id="global.see" />
                      </Button>
                      <Button href={`${edge.node.show_url}#`}>
                        <FormattedMessage id="global.eval" />
                      </Button>
                    </ButtonToolbar>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default createFragmentContainer(
  ProposalFormEvaluationsList,
  graphql`
    fragment ProposalFormEvaluationsList_proposalForm on ProposalForm {
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
            show_url
            reference
            title
            updatedAt
            status {
              name
              id
            }
          }
        }
      }
    }
  `,
);
