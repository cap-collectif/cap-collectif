// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';
import { isSubmitting, submit, change, isInvalid, isPristine } from 'redux-form';
import { Button as BsButton } from 'react-bootstrap';
import { connect } from 'react-redux';
import cn from 'classnames';
import { Button, Heading, ButtonGroup, Modal, CapUIModalSize } from '@cap-collectif/ui';
import ProposalForm, { formName } from '../Form/ProposalForm';
import ProposalDraftAlert from '../Page/ProposalDraftAlert';
import type { Dispatch, GlobalState } from '~/types';
import type {
  ProposalEditModal_proposal,
  ProposalRevisionState,
} from '~relay/ProposalEditModal_proposal.graphql';
import { ProposalRevisionItem } from '~/shared/ProposalRevision/Modal/ProposalRevisionModalForm.style';
import { pxToRem } from '~/utils/styles/mixins';
import ResetCss from '~/utils/ResetCss';
import Collapsable from '~ui/Collapsable';
import { mediaQueryMobile } from '~/utils/sizes';
import colors from '~/styles/modules/colors';
import ProposalOtherPanelsModal from '../Create/ProposalOtherPanelsModal';

type Props = {|
  +intl: IntlShape,
  +proposal: ProposalEditModal_proposal,
  +show: boolean,
  +submitting: boolean,
  +invalid: boolean,
  +pristine: boolean,
  +dispatch: Dispatch,
  +onClose: () => void,
|};

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
  li {
    button {
      padding: 0;
    }
    .body-collapse {
      width: 840px;
      margin-top: 10px;
      @media (max-width: ${mediaQueryMobile.maxWidth}) {
        width: auto;
      }
    }
  }
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
  +body: ?string,
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

const STATE = {
  NORMAL: 'NORMAL',
  LEAVE: 'LEAVE',
  MAP: 'MAP',
  ERROR: 'ERROR',
};

export const ProposalEditModal = ({
  invalid,
  proposal,
  show,
  pristine,
  submitting,
  dispatch,
  intl,
  onClose,
}: Props) => {
  const [modalState, setModalState] = React.useState<$Values<typeof STATE>>('NORMAL');
  const [errorCount, setErrorCount] = React.useState<number>(0);
  const [isDraft, setIsDraft] = React.useState<boolean>(false);
  if (!proposal || !show) return null;
  const pendingRevisions = getProposalPendingRevisions(proposal);
  const isRevisionExpired = isProposalRevisionsExpired(proposal);
  const hasPendingRevisions = pendingRevisions.length > 0;

  return (
    <ModalProposalEditContainer
      size={CapUIModalSize.Lg}
      fullSizeOnMobile
      show={show}
      dialogClassName={cn('custom-modal-dialog', { 'expired-revision': isRevisionExpired })}
      hideCloseButton={modalState === 'LEAVE'}
      hideOnEsc={modalState !== 'LEAVE'}
      hideOnClickOutside={false}
      onClose={() => {
        if (modalState !== 'LEAVE') setModalState('LEAVE');
        else onClose();
      }}
      ariaLabel={intl.formatMessage({ id: 'contained-modal-title-lg' })}>
      {isRevisionExpired ? (
        <>
          <Modal.Header
            closeLabel={intl.formatMessage({ id: 'close.modal' })}
            pb={8}
            borderBottom={`1px solid ${colors.gray[200]}`}
          />
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
          <ResetCss>
            <Modal.Header
              closeLabel={intl.formatMessage({ id: 'close.modal' })}
              borderBottom={['', `1px solid ${colors.gray[200]}`]}>
              <Heading>
                {intl.formatMessage({
                  id: hasPendingRevisions ? 'review-my-proposal' : 'global.edit',
                })}
              </Heading>
            </Modal.Header>
          </ResetCss>
          <AnimatePresence>
            <ProposalOtherPanelsModal
              proposalForm={proposal.form}
              errorCount={errorCount}
              onClose={onClose}
              modalState={modalState}
              resetModalState={() => {
                setModalState('NORMAL');
                setErrorCount(0);
              }}
            />
            {modalState === 'NORMAL' && (
              <motion.div
                key="normal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, display: 'block' }}
                style={{ overflow: 'scroll' }}
                exit={{ opacity: 0, display: 'none' }}>
                <Modal.Body height="unset">
                  <ProposalDraftAlert proposal={proposal} mb={6} />
                  {hasPendingRevisions && (
                    <ProposalRevisionItem as="div" className="mb-10">
                      <p className="font-weight-bold m-0">
                        {intl.formatMessage({ id: 'reason.review.request' })}
                      </p>
                      <ProposalRevisionsList>
                        {pendingRevisions.map(revision => (
                          <li key={revision.id}>
                            <span>{revision.reason}&nbsp;</span>
                            <Collapsable closeOnClickAway={false} className="clearfix">
                              {({ visible }) => (
                                <Collapsable.Button inline={false} showCaret={false}>
                                  {!visible && (
                                    <BsButton variant="link" bsStyle="link">
                                      <FormattedMessage id="open-instructions" />
                                    </BsButton>
                                  )}
                                  <Collapsable.Element isAbsolute={false} ariaLabel="Contenu">
                                    <div dangerouslySetInnerHTML={{ __html: revision.body }} />
                                    <BsButton variant="link" bsStyle="link">
                                      <FormattedMessage id="close-instructions" />
                                    </BsButton>
                                  </Collapsable.Element>
                                </Collapsable.Button>
                              )}
                            </Collapsable>
                          </li>
                        ))}
                      </ProposalRevisionsList>
                      {!proposal.form.contribuable && (
                        <p className="mb-0 mt-20">
                          {intl.formatMessage({ id: 'warning.review.modification' })}
                        </p>
                      )}
                    </ProposalRevisionItem>
                  )}
                  <ProposalForm
                    onAddressEdit={() => setModalState('MAP')}
                    proposalForm={proposal.form}
                    proposal={proposal}
                    isBackOfficeInput={false}
                    onSubmitSuccess={onClose}
                    onSubmitFailed={() => {
                      setErrorCount(errorCount + 1);
                      setModalState('ERROR');
                    }}
                  />
                </Modal.Body>
                <Modal.Footer borderTop={['', `1px solid ${colors.gray[200]}`]}>
                  <ButtonGroup>
                    {proposal.publicationStatus !== 'DRAFT' && (
                      <Button
                        onClick={onClose}
                        variantSize="big"
                        variant="secondary"
                        variantColor="hierarchy"
                        isLoading={submitting}>
                        {intl.formatMessage({ id: 'global.cancel' })}
                      </Button>
                    )}
                    {proposal.publicationStatus === 'DRAFT' && (
                      <Button
                        id="confirm-proposal-create-as-draft"
                        variantSize="big"
                        variant="tertiary"
                        variantColor="primary"
                        isLoading={submitting && isDraft}
                        disabled={pristine || (!isDraft && submitting)}
                        onClick={() => {
                          dispatch(change(formName, 'draft', true));
                          setIsDraft(true);
                          setTimeout(() => {
                            // TODO find a better way
                            // We need to wait validation values to be updated with 'draft'
                            dispatch(submit(formName));
                          }, 200);
                        }}>
                        {intl.formatMessage({ id: 'global.save' })}
                      </Button>
                    )}
                    <Button
                      id="confirm-proposal-edit"
                      variantSize="big"
                      variant="primary"
                      variantColor="primary"
                      isLoading={submitting && !isDraft}
                      disabled={pristine || invalid || (isDraft && submitting)}
                      onClick={() => {
                        dispatch(change(formName, 'draft', false));
                        setIsDraft(false);
                        setTimeout(() => {
                          // TODO find a better way
                          // We need to wait validation values to be updated with 'draft'
                          dispatch(submit(formName));
                        }, 200);
                      }}>
                      {intl.formatMessage({ id: 'global.publish' })}
                    </Button>
                  </ButtonGroup>
                </Modal.Footer>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </ModalProposalEditContainer>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  submitting: isSubmitting(formName)(state),
  pristine: isPristine(formName)(state),
  invalid: isInvalid(formName)(state),
});

const container = connect<any, any, _, _, _, _>(mapStateToProps)(injectIntl(ProposalEditModal));

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalEditModal_proposal on Proposal
    @argumentDefinitions(
      isAuthenticated: { type: "Boolean!" }
      proposalRevisionsEnabled: { type: "Boolean!" }
      isTipsMeeeEnabled: { type: "Boolean!" }
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
            body
          }
        }
      }

      form {
        contribuable
        ...ProposalForm_proposalForm
        ...ProposalOtherPanelsModal_proposalForm
      }
      publicationStatus
      ...ProposalForm_proposal @arguments(isTipsMeeeEnabled: $isTipsMeeeEnabled)
      ...ProposalDraftAlert_proposal
    }
  `,
});
