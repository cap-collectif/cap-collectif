// @flow
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import { Table, Button } from 'react-bootstrap';
import ProposalFormEvaluationRow from './ProposalFormEvaluationRow';
import type { ProposalFormEvaluationList_proposalForm } from '~relay/ProposalFormEvaluationList_proposalForm.graphql';

export const pageSize = 100;

type Props = { relay: RelayPaginationProp } & {
  proposalForm: ProposalFormEvaluationList_proposalForm,
};

export class ProposalFormEvaluationList extends Component<Props> {
  render() {
    const { relay, proposalForm } = this.props;
    if (proposalForm.proposals.totalCount === 0) {
      return null;
    }
    return (
      <div className="container">
        <h4>
          {proposalForm.step && proposalForm.step.project && proposalForm.step.project.title}{' '}
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
        {relay.hasMore() && (
          <Button
            bsStyle="primary"
            onClick={() => {
              if (relay.isLoading()) {
                return;
              }
              relay.loadMore(pageSize);
            }}
            disabled={relay.isLoading()}>
            <FormattedMessage id={relay.isLoading() ? 'global.loading' : 'see-more-proposals'} />
          </Button>
        )}
      </div>
    );
  }
}

export default createPaginationContainer(
  ProposalFormEvaluationList,
  graphql`
    fragment ProposalFormEvaluationList_proposalForm on ProposalForm
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 10 }
        cursor: { type: "String", defaultValue: null }
      ) {
      id
      step {
        title
        project {
          title
        }
      }
      proposals(first: $count, after: $cursor, affiliations: [EVALUER])
        @connection(key: "ProposalFormEvaluationList_proposals") {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
        edges {
          node {
            id
            ...ProposalFormEvaluationRow_proposal
          }
        }
      }
    }
  `,
  {
    direction: 'forward',
    getConnectionFromProps(props: Props) {
      return props.proposalForm && props.proposalForm.proposals;
    },
    getFragmentVariables(prevVars) {
      return {
        ...prevVars,
      };
    },
    getVariables(props: Props, { count, cursor }) {
      return {
        count,
        cursor,
        proposalFormId: props.proposalForm.id,
      };
    },
    query: graphql`
      query ProposalFormEvaluationListQuery($proposalFormId: ID!, $count: Int!, $cursor: String) {
        proposalForm: node(id: $proposalFormId) {
          ...ProposalFormEvaluationList_proposalForm @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  },
);
