// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';
import { isSubmitting, submit, change, isInvalid, isPristine } from 'redux-form';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ProposalForm, { formName } from '../Form/ProposalForm';
import ProposalDraftAlert from '../Page/ProposalDraftAlert';
import type { Dispatch, GlobalState } from '../../../types';
import { closeEditProposalModal } from '../../../redux/modules/proposal';
import type { ProposalEditModal_proposal } from '~relay/ProposalEditModal_proposal.graphql';

type Props = {
  intl: IntlShape,
  proposal: ProposalEditModal_proposal,
  show: boolean,
  submitting: boolean,
  invalid: boolean,
  pristine: boolean,
  dispatch: Dispatch,
};

export class ProposalEditModal extends React.Component<Props> {
  render() {
    const { invalid, proposal, show, pristine, submitting, dispatch, intl } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={() => {
          if (
            // eslint-disable-next-line no-alert
            window.confirm(intl.formatMessage({ id: 'proposal.confirm_close_modal' }))
          ) {
            dispatch(closeEditProposalModal());
          }
        }}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="global.edit" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProposalDraftAlert proposal={proposal} />
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
      </Modal>
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
    fragment ProposalEditModal_proposal on Proposal {
      id
      form {
        ...ProposalForm_proposalForm
      }
      publicationStatus
      ...ProposalForm_proposal
      ...ProposalDraftAlert_proposal
    }
  `,
});
