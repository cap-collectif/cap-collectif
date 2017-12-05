// @flow
import * as React from 'react';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';
import { type ReadyState, QueryRenderer, graphql } from 'react-relay';
import { isSubmitting, submit, isPristine } from 'redux-form';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ProposalForm, { formName } from '../Form/ProposalForm';
import ProposalDraftAlert from '../Page/ProposalDraftAlert';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import type { ProposalEditModalQueryResponse } from './__generated__/ProposalEditModalQuery.graphql';
import type { Uuid, Dispatch, GlobalState } from '../../../types';
import { closeEditProposalModal, setSubmittingDraft } from '../../../redux/modules/proposal';

const render = ({ props, error }: ReadyState & { props: ?ProposalEditModalQueryResponse }) => {
  if (error) {
    return graphqlError;
  }
  if (props) {
    return <ProposalForm proposalForm={props.proposalForm} proposal={props.proposal} />;
  }
  return null;
};

type Props = {
  intl: IntlShape,
  form: { id: Uuid },
  proposal: { id: Uuid, isDraft: boolean },
  show: boolean,
  submitting: boolean,
  pristine: boolean,
  dispatch: Dispatch,
};

class ProposalEditModal extends React.Component<Props> {
  render() {
    const { form, proposal, show, pristine, submitting, dispatch, intl } = this.props;
    return (
      <div>
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
            <QueryRenderer
              environment={environment}
              query={graphql`
                query ProposalEditModalQuery($proposalFormId: ID!, $proposalId: ID!) {
                  proposalForm(id: $proposalFormId) {
                    ...ProposalForm_proposalForm
                  }
                  proposal(id: $proposalId) {
                    ...ProposalForm_proposal
                  }
                }
              `}
              variables={{
                proposalFormId: form.id,
                proposalId: proposal.id,
              }}
              render={render}
            />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              onClose={() => {
                dispatch(closeEditProposalModal());
              }}
            />
            {proposal.isDraft && (
              <SubmitButton
                id="confirm-proposal-create-as-draft"
                isSubmitting={submitting}
                disabled={pristine}
                onSubmit={() => {
                  dispatch(setSubmittingDraft(true));
                  dispatch(submit(formName));
                }}
                label="global.save_as_draft"
              />
            )}
            <SubmitButton
              label="global.submit"
              id="confirm-proposal-edit"
              isSubmitting={submitting}
              onSubmit={() => {
                dispatch(setSubmittingDraft(false));
                dispatch(submit(formName));
              }}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  show: state.proposal.showEditModal,
  submitting: isSubmitting(formName)(state),
  pristine: isPristine(formName)(state),
});

export default connect(mapStateToProps)(injectIntl(ProposalEditModal));
