// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { type ReadyState, QueryRenderer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { isSubmitting, submit } from 'redux-form';
import { Modal } from 'react-bootstrap';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProposalCreateButton from './ProposalCreateButton';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ProposalForm, { formName } from '../Form/ProposalForm';
import {
  openCreateModal,
  closeCreateModal,
  setSubmittingDraft,
} from '../../../redux/modules/proposal';
import type { ProposalCreateQueryResponse } from './__generated__/ProposalCreateQuery.graphql';
import type { Dispatch, GlobalState } from '../../../types';

const render = ({props, error}: ReadyState & { props: ?ProposalCreateQueryResponse }) => {
  if (error) {
    return graphqlError;
  }
  if (props) {
    return <ProposalForm proposalForm={props.proposalForm} proposal={null} />
  }
  return null;
}

type Props = {
  intl: IntlShape,
  form: Object,
  showModal: boolean,
  submitting: boolean,
  dispatch: Dispatch,
};

export class ProposalCreate extends React.Component<Props> {

  render() {
    const { intl, form, showModal, submitting, dispatch } = this.props;
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
              onSubmit={() => {
                dispatch(setSubmittingDraft(true));
                dispatch(submit(formName));
              }}
              // bsStyle="draft"
              label="global.save_as_draft"
            />
            <SubmitButton
              label="global.submit"
              id="confirm-proposal-create"
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
};

const mapStateToProps = (state: GlobalState) => ({
  submitting: isSubmitting(formName)(state),
  showModal: state.proposal.showCreateModal,
});

export default connect(mapStateToProps)(injectIntl(ProposalCreate));
