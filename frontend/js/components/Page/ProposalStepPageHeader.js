// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDisclosure } from '@liinkiing/react-hooks';
import {
  isInterpellationContextFromStep,
  isEstablishmentFormStep,
  getProposalLabelByType,
} from '~/utils/interpellationLabelHelper';
import type { ProposalStepPageHeader_step } from '~relay/ProposalStepPageHeader_step.graphql';
import ProposalCreateModal from '../Proposal/Create/ProposalCreateModal';
import Button from '~ds/Button/Button';
import LoginOverlay from '~/components/Utils/LoginOverlay';

type Props = {
  step: ProposalStepPageHeader_step,
};

export const ProposalStepPageHeader = ({ step }: Props) => {
  const intl = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const projectType = step.project && step.project.type ? step.project.type.title : null;
  const queryCount = step.proposals.totalCount;
  const total = step.allProposals.totalCount;
  const { fusionCount } = step.allProposals;
  const isInterpellation = isInterpellationContextFromStep(step);
  const isEstablishment = isEstablishmentFormStep(step);
  const isProposalForm = step.form && step.form.objectType === 'PROPOSAL';
  const titleTradKey =
    step.form?.objectType === 'ESTABLISHMENT'
      ? getProposalLabelByType(projectType, 'add-establishment')
      : step.form?.objectType === 'PROPOSAL'
      ? getProposalLabelByType(projectType, 'add')
      : 'submit-a-question';
  const tradKeyForTotalCount = isInterpellation
    ? 'interpellation.count_with_total'
    : isEstablishment
    ? 'establishment.count_with_total'
    : isProposalForm
    ? 'proposal.count_with_total'
    : 'question-total-count';
  const tradKeyForCount = isInterpellation
    ? 'interpellation.count'
    : isEstablishment
    ? 'establishment.count'
    : isProposalForm
    ? 'proposal.count'
    : 'count-questions';

  return (
    <>
      <ProposalCreateModal
        title={titleTradKey}
        proposalForm={step.form}
        show={isOpen}
        onClose={onClose}
      />
      <div id="proposal-step-page-header">
        <h3 className="h3 d-ib mb-15">
          {total !== queryCount ? (
            <FormattedMessage
              id={tradKeyForTotalCount}
              values={{
                num: queryCount,
                total,
              }}
            />
          ) : (
            <FormattedMessage
              id={tradKeyForCount}
              values={{
                num: total,
              }}
            />
          )}
          {step.form && step.kind === 'collect' && fusionCount > 0 && (
            <span className="font-weight-300 color-dark-gray">
              {' '}
              <FormattedMessage
                id={
                  isInterpellation || isEstablishment
                    ? 'interpellation.count_fusions'
                    : 'proposal.count_fusions'
                }
                values={{
                  num: fusionCount,
                }}
              />
            </span>
          )}
        </h3>
        {step.form && step.kind === 'collect' && (
          <span className="pull-right mb-20 mt-20">
            <LoginOverlay>
              <Button
                disabled={!step.form?.contribuable}
                variant="primary"
                variantColor="primary"
                variantSize="small"
                onClick={onOpen}
                id="add-proposal">
                {intl.formatMessage({ id: titleTradKey })}
              </Button>
            </LoginOverlay>
          </span>
        )}
      </div>
    </>
  );
};

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
          objectType
          contribuable
          ...ProposalCreateModal_proposalForm
        }
        project {
          type {
            title
          }
        }
        voteThreshold
      }
      ... on SelectionStep {
        kind
        form {
          contribuable
          id
          objectType
          ...ProposalCreateModal_proposalForm
        }

        project {
          type {
            title
          }
        }
        ...interpellationLabelHelper_step @relay(mask: false)
      }
    }
  `,
});
