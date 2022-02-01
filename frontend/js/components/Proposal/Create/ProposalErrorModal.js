// @flow
import * as React from 'react';
import { useIntl, type IntlShape } from 'react-intl';
import { reset, isSubmitting, submit, SubmissionError } from 'redux-form';
import { useDispatch, connect } from 'react-redux';
import { Flex, Text, Button, Modal, toast } from '@cap-collectif/ui';
import { graphql, useFragment } from 'react-relay';
import { EDIT_MODAL_ANCHOR, formName } from '../Form/ProposalForm';
import type { Dispatch, GlobalState } from '~/types';
import CreateProposalMutation from '~/mutations/CreateProposalMutation';
import { isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper';
import { mapOpenPopup } from '~/components/Proposal/Map/Map.events';
import type {
  ProposalErrorModal_proposalForm,
  ProposalErrorModal_proposalForm$key,
} from '~relay/ProposalErrorModal_proposalForm.graphql';
import type {
  ProposalErrorModal_proposal,
  ProposalErrorModal_proposal$key,
} from '~relay/ProposalErrorModal_proposal.graphql';
import type { CreateProposalInput } from '~relay/CreateProposalMutation.graphql';
import type { ChangeProposalContentInput } from '~relay/ChangeProposalContentMutation.graphql';
import ChangeProposalContentMutation from '~/mutations/ChangeProposalContentMutation';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';

type Props = {|
  +onClose: () => void,
  +resetModalState: () => void,
  +allowRetry: boolean,
  +submitting: boolean,
  +valuesSaved: ?CreateProposalInput | ?ChangeProposalContentInput,
  +proposalForm: ProposalErrorModal_proposalForm$key,
  +proposal: ProposalErrorModal_proposal$key,
  +onSubmitFailed: () => void,
|};

const saveProposal = (
  data: CreateProposalInput | ChangeProposalContentInput,
  proposalForm: ProposalErrorModal_proposalForm,
  proposal: ProposalErrorModal_proposal,
  proposalRevisionsEnabled: boolean,
  intl: IntlShape,
  dispatch: Dispatch,
  onClose: () => void,
  onSubmitFailed: () => void,
) => {
  if (data.proposalFormId) {
    return CreateProposalMutation.commit({
      input: {
        ...data,
        proposalFormId: proposalForm.id,
      },
      stepId: proposalForm.step?.id || '',
    })
      .then(response => {
        if (response.createProposal && response.createProposal.userErrors) {
          for (const error of response.createProposal.userErrors) {
            if (error.message === 'You contributed too many times.') {
              throw new SubmissionError({ _error: 'publication-limit-reached' });
            }
          }
        }
        if (!response.createProposal || !response.createProposal.proposal) {
          throw new Error('Mutation "saveProposal" failed.');
        }
        const createdProposal = response.createProposal.proposal;
        window.removeEventListener('beforeunload', e => {
          // $FlowFixMe voir https://github.com/facebook/flow/issues/3690
          e.returnValue = true;
        });
        const message =
          createdProposal && isInterpellationContextFromProposal(createdProposal)
            ? 'interpellation.create.redirecting'
            : 'proposal.create.redirecting';
        toast({
          variant: 'success',
          content: intl.formatHTMLMessage({
            id: data.draft ? 'draft.create.registered' : message,
          }),
        });
        dispatch(reset(formName));
        if (data.draft) {
          const draftAnchor = document.getElementById('draftAnchor');
          if (draftAnchor) draftAnchor.scrollIntoView({ behavior: 'smooth' });
        } else {
          const proposalsAnchor = document.getElementById('proposal-step-page-header');
          if (proposalsAnchor) proposalsAnchor.scrollIntoView({ behavior: 'smooth' });
          if (data.address) {
            const address = JSON.parse(data.address.substring(1, data.address.length - 1));
            if (address?.geometry?.location) mapOpenPopup(address.geometry.location);
          }
        }
        onClose();
      })
      .catch(e => {
        onSubmitFailed();
        if (e instanceof SubmissionError) {
          throw e;
        }
        throw new SubmissionError({
          _error: 'global.error.server.form',
        });
      });
  }

  if (data.id) {
    return ChangeProposalContentMutation.commit({
      input: { ...data, id: proposal.id },
      proposalRevisionsEnabled,
    })
      .then(response => {
        if (!response.changeProposalContent || !response.changeProposalContent.proposal) {
          throw new Error('Mutation "changeProposalContent" failed.');
        }
        window.removeEventListener('beforeunload', e => {
          // $FlowFixMe voir https://github.com/facebook/flow/issues/3690
          e.returnValue = true;
        });
        onClose();
        if (window.location.href.includes(EDIT_MODAL_ANCHOR)) {
          window.history.replaceState(
            null,
            '',
            window.location.href.replace(EDIT_MODAL_ANCHOR, ''),
          );
        }
        window.location.reload();
      })
      .catch(() => {
        onSubmitFailed();
        throw new SubmissionError({
          _error: 'global.error.server.form',
        });
      });
  }
};

const PROPOSALFORM_FRAGMENT = graphql`
  fragment ProposalErrorModal_proposalForm on ProposalForm {
    id
    step {
      id
    }
  }
`;

const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalErrorModal_proposal on Proposal {
    id
  }
`;

const ProposalErrorModal = ({
  onClose,
  resetModalState,
  allowRetry,
  submitting,
  valuesSaved,
  proposalForm: proposalFormFragment,
  proposal: proposalFragment,
  onSubmitFailed,
}: Props): React.Node => {
  const intl = useIntl();
  const dispatch: Dispatch = useDispatch();
  const proposalForm = useFragment(PROPOSALFORM_FRAGMENT, proposalFormFragment);
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalFragment);
  const proposalRevisionsEnabled = useFeatureFlag('proposal_revisions');

  return (
    <>
      <Modal.Body>
        <Flex direction="column" alignItems="center" my={[0, '20%']}>
          <Text textAlign="center" fontSize={33} mb={8}>
            <span className="d-b emoji-container" role="img" aria-label="Downcast Face with Sweat">
              😓
            </span>
          </Text>
          <Text textAlign="center" fontSize={[20, 33]} fontWeight={600} mb={2}>
            {intl.formatMessage({ id: 'error.title.damn' })}
          </Text>
          <Text textAlign="center">
            {intl.formatMessage({
              id: allowRetry ? 'error.try.again' : 'error.persist.try.again',
            })}
          </Text>
        </Flex>
      </Modal.Body>
      <Modal.Footer>
        {!allowRetry && (
          <Button
            variantSize="big"
            variant="primary"
            variantColor="danger"
            onClick={() => {
              resetModalState();
              onClose();
              dispatch(reset(formName));
            }}>
            {intl.formatMessage({ id: 'leave-form-confirm' })}
          </Button>
        )}
        {allowRetry && (
          <Button
            variantSize="big"
            variant="primary"
            variantColor="primary"
            isLoading={submitting}
            onClick={() => {
              if (valuesSaved) {
                saveProposal(
                  valuesSaved,
                  proposalForm,
                  proposal,
                  proposalRevisionsEnabled,
                  intl,
                  dispatch,
                  onClose,
                  onSubmitFailed,
                );
              }
              dispatch(submit(formName));
            }}>
            {intl.formatMessage({ id: 'save-my-proposal' })}
          </Button>
        )}
      </Modal.Footer>
    </>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  submitting: isSubmitting(formName)(state),
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(ProposalErrorModal);
