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

    const queryCount = step.proposals.totalCount;

    const total = step.allProposals.totalCount;
    const fusionCount = step.allProposals.fusionCount;

    return (
      <React.Fragment>
        <h3 className="h3 d-ib" style={{ marginBottom: '15px' }}>
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
            step.kind === 'collect' &&
            fusionCount > 0 && (
              <span style={{ color: '#999', fontWeight: 300 }}>
                {' '}
                <FormattedMessage
                  id="proposal.count_fusions"
                  values={{
                    num: fusionCount,
                  }}
                />
              </span>
            )}
        </h3>
        {step.form &&
          step.kind === 'collect' && (
            <span className="pull-right mb-20 mt-20">
              <ProposalCreate proposalForm={step.form} />
            </span>
          )}
      </React.Fragment>
    );
  }
}

export default createFragmentContainer(ProposalStepPageHeader, {
  step: graphql`
    fragment ProposalStepPageHeader_step on ProposalStep {
      id
      allProposals: proposals(first: 0) {
        totalCount
        fusionCount
      }
      proposals(
        first: $count
        after: $cursor
        orderBy: $orderBy
        term: $term
        district: $district
        theme: $theme
        category: $category
        status: $status
        userType: $userType
      ) @connection(key: "ProposalStepPageHeader_proposals", filters: []) {
        totalCount
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
          ...ProposalCreate_proposalForm
        }
        voteThreshold
      }
      ... on SelectionStep {
        kind
      }
    }
  `,
});
