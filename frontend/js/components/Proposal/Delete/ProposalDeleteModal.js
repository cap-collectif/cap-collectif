// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedHTMLMessage, FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import { deleteProposal, closeDeleteProposalModal } from '../../../redux/modules/proposal';
import type { State, Dispatch } from '../../../types';
import type { ProposalDeleteModal_proposal } from '~relay/ProposalDeleteModal_proposal.graphql';
import { isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper';

type Props = {
  proposal: ProposalDeleteModal_proposal,
  show: boolean,
  isDeleting: boolean,
  dispatch: Dispatch,
};

export const ProposalDeleteModal = ({ proposal, show, isDeleting, dispatch }: Props) => {
  const intl = useIntl();

  if (!proposal) return null;
  return (
    <div>
      <Modal
        animation={false}
        show={show}
        onHide={() => {
          dispatch(closeDeleteProposalModal());
        }}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton closeLabel={intl.formatMessage({ id: 'close.modal' })}>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage
              id={
                isInterpellationContextFromProposal(proposal)
                  ? 'interpellation.removeMessage'
                  : 'global.removeMessage'
              }
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <FormattedHTMLMessage
              id={
                isInterpellationContextFromProposal(proposal)
                  ? 'interpellation.delete.confirm'
                  : 'proposal.delete.confirm'
              }
              values={{
                title: proposal.title,
              }}
            />
          </p>
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            onClose={() => {
              dispatch(closeDeleteProposalModal());
            }}
          />
          <SubmitButton
            id="confirm-proposal-delete"
            isSubmitting={isDeleting}
            onSubmit={() => {
              deleteProposal(proposal.id, dispatch);
            }}
            label="global.removeDefinitively"
            bsStyle="danger"
          />
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state: State) => ({
  isDeleting: state.proposal.isDeleting,
  show: state.proposal.showDeleteModal,
});
const container = connect<any, any, _, _, _, _>(mapStateToProps)(ProposalDeleteModal);

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalDeleteModal_proposal on Proposal {
      id
      title
      ...interpellationLabelHelper_proposal @relay(mask: false)
    }
  `,
});
