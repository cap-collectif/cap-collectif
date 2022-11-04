// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDisclosure } from '@liinkiing/react-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { reset } from 'redux-form';
import { Box, Button } from '@cap-collectif/ui';
import {
  isInterpellationContextFromStep,
  isEstablishmentFormStep,
  getProposalLabelByType,
  isOpinionFormStep,
} from '~/utils/interpellationLabelHelper';
import type { Dispatch, GlobalState } from '~/types';
import type { ProposalStepPageHeader_step } from '~relay/ProposalStepPageHeader_step.graphql';
import ProposalCreateModal from '../Proposal/Create/ProposalCreateModal';
import NewLoginOverlay from '~/components/Utils/NewLoginOverlay';
import { formName } from '../Proposal/Form/ProposalForm';
import useIsMobile from '~/utils/hooks/useIsMobile';
import type { ProposalViewMode } from '~/redux/modules/proposal';

type Props = {
  step: ProposalStepPageHeader_step,
  displayMode: ?ProposalViewMode,
};

export const ProposalStepPageHeader = ({ step, displayMode }: Props) => {
  const intl = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useIsMobile();
  const dispatch = useDispatch<Dispatch>();
  const { btnBgColor, btnTextColor } = useSelector((state: GlobalState) => ({
    btnBgColor: state.default.parameters['color.btn.primary.bg'],
    btnTextColor: state.default.parameters['color.btn.primary.text'],
  }));
  const projectType = step.project && step.project.type ? step.project.type.title : null;
  const queryCount = step.proposals.totalCount;
  const total = step.allProposals.totalCount;
  const { fusionCount } = step.allProposals;
  const isInterpellation = isInterpellationContextFromStep(step);
  const isEstablishment = isEstablishmentFormStep(step);
  const isOpinion = isOpinionFormStep(step);
  const isProposalForm = step.form && step.form.objectType === 'PROPOSAL';
  const titleTradKey = isEstablishment
    ? getProposalLabelByType(projectType, 'add-establishment')
    : step.form?.objectType === 'QUESTION'
    ? 'submit-a-question'
    : isOpinion
    ? 'submit-opinion'
    : getProposalLabelByType(projectType, 'add');
  const tradKeyForTotalCount = isInterpellation
    ? 'interpellation.count_with_total'
    : isEstablishment
    ? 'establishment.count_with_total'
    : isOpinion
    ? 'opinion.count_with_total'
    : isProposalForm
    ? 'proposal.count_with_total'
    : 'question-total-count';
  const tradKeyForCount = isInterpellation
    ? 'interpellation.count'
    : isEstablishment
    ? 'establishment.count'
    : isOpinion
    ? 'opinion.count'
    : isProposalForm
    ? 'proposal.count'
    : 'count-questions';
  const tradKeyForFusion =
    isInterpellation || isEstablishment
      ? 'interpellation.count_fusions'
      : isOpinion
      ? 'opinion.count_fusions'
      : 'proposal.count_fusions';
  return (
    <>
      <ProposalCreateModal
        title={titleTradKey}
        proposalForm={step.form}
        show={isOpen}
        onClose={onClose}
        onOpen={() => dispatch(reset(formName))}
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
                count: total,
              }}
            />
          )}
          {step.form && step.kind === 'collect' && fusionCount > 0 && (
            <span className="font-weight-300 color-dark-gray">
              {' '}
              <FormattedMessage
                id={tradKeyForFusion}
                values={{
                  num: fusionCount,
                }}
              />
            </span>
          )}
        </h3>
        {step.form && step.kind === 'collect' && (
          <Box
            as={isMobile ? 'div' : 'span'}
            my={[0, 20]}
            position={['fixed', 'relative']}
            width={['100%', 'unset']}
            left={[0, 'unset']}
            p={[4, 0]}
            zIndex={1000}
            bottom={[0, 'unset']}
            bg={['white', 'unset']}
            boxShadow={['0px 10px 50px rgba(0, 0, 0, 0.15)', 'unset']}
            borderRadius={['8px 8px 0px 0px', 'unset']}
            className={isMobile ? '' : 'pull-right'}
            display={displayMode === 'MAP' && isMobile ? 'none' : 'block'}>
            <NewLoginOverlay>
              <Button
                m="auto"
                maxWidth="300px"
                disabled={!step.form?.contribuable}
                opacity={!step.form?.contribuable ? 0.5 : 1}
                bg={`${btnBgColor} !important`}
                color={`${btnTextColor} !important`}
                variantSize={isMobile ? 'big' : 'small'}
                onClick={onOpen}
                id="add-proposal"
                width={['100%', '']}
                textAlign="center"
                display="block">
                {intl.formatMessage({ id: titleTradKey })}
              </Button>
            </NewLoginOverlay>
          </Box>
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
