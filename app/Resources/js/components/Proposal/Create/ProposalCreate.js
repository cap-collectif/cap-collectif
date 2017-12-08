// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { type ReadyState, QueryRenderer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { isSubmitting, change, submit, isPristine } from 'redux-form';
import { Modal } from 'react-bootstrap';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProposalCreateButton from './ProposalCreateButton';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ProposalForm, { formName } from '../Form/ProposalForm';
import { openCreateModal, closeCreateModal } from '../../../redux/modules/proposal';
import type { ProposalCreateQueryResponse } from './__generated__/ProposalCreateQuery.graphql';
import type { Uuid, Dispatch, GlobalState } from '../../../types';

const render = ({ props, error }: ReadyState & { props: ?ProposalCreateQueryResponse }) => {
  if (error) {
    return graphqlError;
  }
  if (props) {
    return <ProposalForm proposalForm={props.proposalForm} proposal={null} />;
  }
  return null;
};

type Props = {
  intl: IntlShape,
  form: { isContribuable: boolean, id: Uuid },
  showModal: boolean,
  submitting: boolean,
  pristine: boolean,
  dispatch: Dispatch,
};

export class ProposalCreate extends React.Component<Props> {
  render() {
    const { intl, form, showModal, pristine, submitting, dispatch } = this.props;
    return (
      <div>
        <ProposalCreateButton
          disabled={!form.isContribuable}
          handleClick={() => dispatch(openCreateModal())}
        />
        <Modal
          animation={false}
          show={showModal}
          onHide={() => {
            if (
              // eslint-disable-next-line no-alert
              window.confirm(intl.formatMessage({ id: 'proposal.confirm_close_modal' }))
            ) {
              dispatch(closeCreateModal());
            }
          }}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <FormattedMessage id="proposal.add" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <QueryRenderer
              environment={environment}
              query={graphql`
                query ProposalCreateQuery($proposalFormId: ID!) {
                  proposalForm(id: $proposalFormId) {
                    ...ProposalForm_proposalForm
                  }
                }
              `}
              variables={{
                proposalFormId: form.id,
              }}
              render={render}
            />
          </Modal.Body>
          <Modal.Footer>
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
              label="global.submit"
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
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  submitting: isSubmitting(formName)(state),
  pristine: isPristine(formName)(state),
  showModal: state.proposal.showCreateModal,
});

export default connect(mapStateToProps)(injectIntl(ProposalCreate));
