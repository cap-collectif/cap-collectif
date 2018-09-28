// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { Modal } from 'react-bootstrap';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import { deleteProposal, closeDeleteProposalModal } from '../../../redux/modules/proposal';
import type { State, Dispatch } from '../../../types';
import type { ProposalDeleteModal_proposal } from './__generated__/ProposalDeleteModal_proposal.graphql';

type Props = {
  proposal: ProposalDeleteModal_proposal,
  show: boolean,
  isDeleting: boolean,
  dispatch: Dispatch,
};

export class ProposalDeleteModal extends React.Component<Props> {
  render() {
    const { proposal, show, isDeleting, dispatch } = this.props;
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
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <FormattedMessage id="global.removeMessage" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <FormattedHTMLMessage
                id="proposal.delete.confirm"
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
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  isDeleting: state.proposal.isDeleting,
  show: state.proposal.showDeleteModal,
});
const container = connect(mapStateToProps)(ProposalDeleteModal);

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalDeleteModal_proposal on Proposal {
      id
      title
    }
  `,
});
