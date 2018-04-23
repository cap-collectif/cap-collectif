// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import ProposalCreate from '../Proposal/Create/ProposalCreate';
import type { ProposalStepPageHeader_step } from './__generated__/ProposalStepPageHeader_step.graphql';

type Props = {
  step: ProposalStepPageHeader_step,
};

export class ProposalStepPageHeader extends React.Component<Props> {
  render() {
    const { step } = this.props;

    const proposals = step.proposals;
    const queryCount = proposals.edges ? proposals.edges.length : 0;
    const total = proposals.totalCount;

    return (
      <h3 className="h3" style={{ marginBottom: '15px' }}>
        {total !== queryCount ? (
          <FormattedMessage
            id="proposal.count_with_total"
            values={{
              num: queryCount,
              total,
            }}
          />
        ) : (
          <FormattedMessage
            id="proposal.count"
            values={{
              num: total,
            }}
          />
        )}
        {step.form &&
          step.kind === 'collect' && (
            <span>
              {proposals.fusionCount > 0 && (
                <span style={{ color: '#999', fontWeight: 300 }}>
                  <FormattedMessage
                    id="proposal.count_fusions"
                    values={{
                      num: proposals.fusionCount,
                    }}
                  />
                </span>
              )}
              <span className="pull-right">
                <ProposalCreate form={step.form} />
              </span>
            </span>
          )}
      </h3>
    );
  }
}

export default createFragmentContainer(ProposalStepPageHeader, {
  step: graphql`
    fragment ProposalStepPageHeader_step on ProposalStep {
      id
      proposals(
        first: $count
        orderBy: $orderBy
        term: $term
        district: $district
        theme: $theme
        category: $category
        status: $status
        userType: $userType
      ) @connection(key: "ProposalStepPageHeader_proposals") {
        totalCount
        fusionCount
        edges {
          node {
            id
          }
        }
      }
      ... on CollectStep {
        kind
        form {
          id
          contribuable
        }
        voteThreshold
      }
      ... on SelectionStep {
        kind
      }
    }
  `,
});
