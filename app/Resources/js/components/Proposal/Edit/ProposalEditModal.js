// @flow
import * as React from 'react';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';
import { type ReadyState, QueryRenderer, graphql } from 'react-relay';
import { isSubmitting, submit, change, isInvalid, isPristine } from 'redux-form';
import { Modal } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ProposalForm, { formName } from '../Form/ProposalForm';
import ProposalDraftAlert from '../Page/ProposalDraftAlert';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import type { ProposalEditModalQueryResponse } from './__generated__/ProposalEditModalQuery.graphql';
import type { Uuid, Dispatch, GlobalState } from '../../../types';
import { closeEditProposalModal } from '../../../redux/modules/proposal';

type Props = {
  intl: IntlShape,
  form: { id: Uuid },
  proposal: { id: Uuid, isDraft: boolean },
  show: boolean,
  submitting: boolean,
  invalid: boolean,
  pristine: boolean,
  dispatch: Dispatch,
};

class ProposalEditModal extends React.Component<Props> {
  render() {
    const { invalid, form, proposal, show, pristine, submitting, dispatch, intl } = this.props;
    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProposalEditModalQuery($proposalFormId: ID!, $proposalId: ID!) {
              proposalForm: node(id: $proposalFormId) {
                ...ProposalForm_proposalForm
              }
              proposal: node(id: $proposalId) {
                ...ProposalForm_proposal
                ...ProposalDraftAlert_proposal
                publicationStatus
              }
            }
          `}
          variables={{
            proposalFormId: form.id,
            proposalId: proposal.id,
          }}
          render={({ props, error }: ReadyState & { props: ?ProposalEditModalQueryResponse }) => {
            if (error) {
              return graphqlError;
            }
            if (props) {
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
                    <ProposalDraftAlert proposal={props.proposal} />
                    <ProposalForm proposalForm={props.proposalForm} proposal={props.proposal} />;
                  </Modal.Body>
                  <Modal.Footer>
                    <CloseButton
                      onClose={() => {
                        dispatch(closeEditProposalModal());
                      }}
                    />
                    {props.proposal.publicationStatus === 'DRAFT' && (
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
            return null;
          }}
        />
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => ({
  show: state.proposal.showEditModal,
  submitting: isSubmitting(formName)(state),
  pristine: isPristine(formName)(state),
  invalid: isInvalid(formName)(state),
});

export default connect(mapStateToProps)(injectIntl(ProposalEditModal));
