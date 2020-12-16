// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import { createFragmentContainer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { isSubmitting, change, submit, isPristine, isInvalid } from 'redux-form';
import { Modal } from 'react-bootstrap';
import ProposalCreateButton from './ProposalCreateButton';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ProposalForm, { formName } from '../Form/ProposalForm';
import { openCreateModal, closeCreateModal } from '~/redux/modules/proposal';
import { getProposalLabelByType } from '~/utils/interpellationLabelHelper';
import type { Dispatch, GlobalState } from '~/types';
import type { ProposalCreate_proposalForm } from '~relay/ProposalCreate_proposalForm.graphql';
import { mediaQueryMobile } from '~/utils/sizes';
import AlertForm from '~/components/Alert/AlertForm';

type Props = {
  intl: IntlShape,
  proposalForm: ProposalCreate_proposalForm,
  showModal: boolean,
  submitting: boolean,
  pristine: boolean,
  invalid: boolean,
  dispatch: Dispatch,
  projectType: string,
};

const ModalProposalCreateContainer: StyledComponent<{}, {}, typeof Modal> = styled(Modal).attrs({
  className: 'proposalCreate__modal',
})`
  && .custom-modal-dialog {
    transform: none;
  }
`;

const ModalProposalFormFooter: StyledComponent<{}, {}, typeof Modal.Footer> = styled(Modal.Footer)`
  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    display: flex;
    flex-direction: column-reverse;

    .btn,
    .btn + .btn {
      width: 200px;
      margin: auto auto 5px auto;
    }

    .alert__form_invalid-field {
      text-align: center;
    }
  }
`;

export class ProposalCreate extends React.Component<Props> {
  render() {
    const {
      intl,
      proposalForm,
      showModal,
      pristine,
      submitting,
      dispatch,
      projectType,
      invalid,
    } = this.props;

    const modalTitleTradKey =
      proposalForm.objectType === 'PROPOSAL'
        ? getProposalLabelByType(projectType, 'add')
        : proposalForm.objectType === 'ESTABLISHMENT'
        ? 'proposal.add-establishment'
        : 'submit-a-question';

    return (
      <div>
        <ProposalCreateButton
          proposalForm={proposalForm}
          projectType={projectType}
          disabled={!proposalForm.contribuable}
          handleClick={() => dispatch(openCreateModal())}
        />
        <ModalProposalCreateContainer
          animation={false}
          show={showModal}
          dialogClassName="custom-modal-dialog"
          onHide={() => {
            if (
              // eslint-disable-next-line no-alert
              window.confirm(
                intl.formatMessage({
                  id: getProposalLabelByType(projectType, 'confirm_close_modal'),
                }),
              )
            ) {
              dispatch(closeCreateModal());
            }
          }}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <FormattedMessage id={modalTitleTradKey} tagName="b" />
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <ProposalForm proposalForm={proposalForm} proposal={null} />
          </Modal.Body>

          <ModalProposalFormFooter>
            <AlertForm invalid={invalid && !pristine} />
            <CloseButton onClose={() => dispatch(closeCreateModal())} />
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
            <SubmitButton
              label={
                proposalForm.objectType === 'ESTABLISHMENT'
                  ? 'submit-establishment'
                  : 'global.submit'
              }
              id="confirm-proposal-create"
              isSubmitting={submitting}
              disabled={pristine}
              onSubmit={() => {
                dispatch(change(formName, 'draft', false));
                setTimeout(() => {
                  // TODO find a better way
                  // We need to wait validation values to be updated with 'draft'
                  dispatch(submit(formName));
                }, 200);
              }}
            />
          </ModalProposalFormFooter>
        </ModalProposalCreateContainer>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  submitting: isSubmitting(formName)(state),
  pristine: isPristine(formName)(state),
  invalid: isInvalid(formName)(state),
  showModal: state.proposal.showCreateModal,
});

const container = connect(mapStateToProps)(injectIntl(ProposalCreate));

export default createFragmentContainer(container, {
  proposalForm: graphql`
    fragment ProposalCreate_proposalForm on ProposalForm {
      id
      contribuable
      objectType
      ...ProposalForm_proposalForm
      ...ProposalCreateButton_proposalForm
    }
  `,
});
