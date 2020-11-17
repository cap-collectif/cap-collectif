// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';
import { isSubmitting, submit, change, isInvalid, isPristine } from 'redux-form';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import cn from 'classnames';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ProposalForm, { formName } from '../Form/ProposalForm';
import ProposalDraftAlert from '../Page/ProposalDraftAlert';
import type { Dispatch, GlobalState } from '~/types';
import { closeEditProposalModal } from '~/redux/modules/proposal';
import type {
  ProposalEditModal_proposal,
  ProposalRevisionState,
} from '~relay/ProposalEditModal_proposal.graphql';
import { ProposalRevisionItem } from '~/shared/ProposalRevision/Modal/ProposalRevisionModalForm.style';
import { pxToRem } from '~/utils/styles/mixins';

type Props = {
  intl: IntlShape,
  proposal: ProposalEditModal_proposal,
  show: boolean,
  submitting: boolean,
  invalid: boolean,
  pristine: boolean,
  dispatch: Dispatch,
};

const ModalProposalEditContainer: StyledComponent<{}, {}, typeof Modal> = styled(Modal).attrs({
  className: 'proposalCreate__modal',
})`
  && .custom-modal-dialog {
    transform: none;
  }

  & > .expired-revision .modal-body {
    height: 60vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    & h2 {
      font-weight: 600;
      color: #232b31;
      font-size: ${pxToRem(18)};
    }

    & p {
      color: #545e68;
    }

    & .emoji-container {
      font-size: 5rem;
      margin-bottom: 10px;
    }
  }
`;

const ProposalRevisionsList: StyledComponent<{}, {}, HTMLUListElement> = styled.ul`
  list-style: '- ';
  padding-left: 10px;
  margin-top: 10px;
  margin-bottom: 0;
  & > li + li {
    margin-top: 10px;
  }
`;

const isProposalRevisionsExpired = (proposal: ProposalEditModal_proposal): boolean => {
  if (!proposal.allRevisions) return false;
  const unrevisedRevisions =
    proposal.allRevisions.totalCount > 0
      ? proposal.allRevisions?.edges
          ?.filter(Boolean)
          .map(edge => edge.node)
          .filter(revision => revision.state !== 'REVISED')
      : [];

  return unrevisedRevisions
    ? unrevisedRevisions.length > 0 && unrevisedRevisions.every(revision => revision.isExpired)
    : false;
};

// cp of edge node type, but if we had TypeScript, we could have done
// : readonly Array<ProposalEditModal_proposal['allRevisions']['edges'][0]['node']>
// to pick the type of a sample of an element in an array, but Flow ¯\_(ツ)_/¯
const getProposalPendingRevisions = (
  proposal: ProposalEditModal_proposal,
): $ReadOnlyArray<{|
  +id: string,
  +state: ProposalRevisionState,
  +isExpired: boolean,
  +reason: ?string,
|}> => {
  if (!proposal.allRevisions) return [];
  return (
    proposal.allRevisions.edges
      ?.filter(Boolean)
      .map(edge => edge.node)
      .filter(revision => revision.state === 'PENDING')
      .filter(revision => !revision.isExpired) ?? []
  );
};

export class ProposalEditModal extends React.Component<Props> {
  render() {
    const { invalid, proposal, show, pristine, submitting, dispatch, intl } = this.props;
    if (!proposal) return null;
    const pendingRevisions = getProposalPendingRevisions(proposal);
    const isRevisionExpired = isProposalRevisionsExpired(proposal);
    const hasPendingRevisions = pendingRevisions.length > 0;
    return (
      <ModalProposalEditContainer
        animation={false}
        show={show}
        dialogClassName={cn('custom-modal-dialog', { 'expired-revision': isRevisionExpired })}
        onHide={() => {
          if (isRevisionExpired) {
            dispatch(closeEditProposalModal());
          } else if (
            // eslint-disable-next-line no-alert
            window.confirm(intl.formatMessage({ id: 'proposal.confirm_close_modal' }))
          ) {
            dispatch(closeEditProposalModal());
          }
        }}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        {isRevisionExpired ? (
          <>
            <Modal.Header closeButton />
            <Modal.Body>
              <span className="d-b emoji-container" role="img" aria-label="Crying Face">
                😓
              </span>
              <FormattedMessage tagName="h2" id="global.sorry" />
              <FormattedMessage tagName="p" id="expired.review.request" />
            </Modal.Body>
          </>
        ) : (
          <>
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-lg">
                <FormattedMessage id={hasPendingRevisions ? 'review-my-proposal' : 'global.edit'} />
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ProposalDraftAlert proposal={proposal} />
              {hasPendingRevisions && (
                <ProposalRevisionItem as="div" className="mb-10">
                  <p className="font-weight-bold m-0">
                    {intl.formatMessage({ id: 'reason.review.request' })}
                  </p>
                  <ProposalRevisionsList>
                    {pendingRevisions.map(revision => (
                      <li key={revision.id}>{revision.reason}</li>
                    ))}
                  </ProposalRevisionsList>
                  {!proposal.form.contribuable && (
                    <p className="mb-0 mt-20">
                      {intl.formatMessage({ id: 'warning.review.modification' })}
                    </p>
                  )}
                </ProposalRevisionItem>
              )}
              <ProposalForm proposalForm={proposal.form} proposal={proposal} />
            </Modal.Body>
            <Modal.Footer>
              <CloseButton
                onClose={() => {
                  dispatch(closeEditProposalModal());
                }}
              />
              {proposal.publicationStatus === 'DRAFT' && (
                <SubmitButton
                  id="confirm-proposal-create-as-draft"
                  isSubmitting={submitting}
                  disabled={pristine}
                  onSubmit={() => {
                    dispatch(change(formName, 'draft', true));
                    setTimeout(() => {
                      // TODO find a better way
                      // We need to wait validation values to be updated with 'draft'
                      dispatch(submit(formName));
                    }, 200);
                  }}
                  label="global.save_as_draft"
                />
              )}
              <SubmitButton
                label="global.submit"
                id="confirm-proposal-edit"
                isSubmitting={submitting}
                disabled={invalid}
                onSubmit={() => {
                  dispatch(change(formName, 'draft', false));
                  setTimeout(() => {
                    // TODO find a better way
                    // We need to wait validation values to be updated with 'draft'
                    dispatch(submit(formName));
                  }, 200);
                }}
              />
            </Modal.Footer>
          </>
        )}
      </ModalProposalEditContainer>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  show: state.proposal.showEditModal,
  submitting: isSubmitting(formName)(state),
  pristine: isPristine(formName)(state),
  invalid: isInvalid(formName)(state),
});

const container = connect(mapStateToProps)(injectIntl(ProposalEditModal));

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalEditModal_proposal on Proposal
      @argumentDefinitions(
        isAuthenticated: { type: "Boolean!" }
        proposalRevisionsEnabled: { type: "Boolean!" }
      ) {
      id
      allRevisions: revisions @include(if: $proposalRevisionsEnabled) {
        totalCount
        edges {
          node {
            id
            state
            isExpired
            reason
          }
        }
      }

      form {
        contribuable
        ...ProposalForm_proposalForm
      }
      publicationStatus
      ...ProposalForm_proposal
      ...ProposalDraftAlert_proposal
    }
  `,
});
