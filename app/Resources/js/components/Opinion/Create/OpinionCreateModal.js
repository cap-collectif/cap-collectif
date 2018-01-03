// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import type { IntlShape } from 'react-intl';
import OpinionCreateForm, { formName } from '../Form/OpinionCreateForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { closeOpinionCreateModal } from '../../../redux/modules/opinion';
import type { State, Dispatch } from '../../../types';

type Props = {
  intl: IntlShape,
  show: boolean,
  projectId: string,
  stepId: string,
  step: Object,
  opinionType: Object,
  submitting: boolean,
  dispatch: Dispatch,
};

export class OpinionCreateModal extends React.Component<Props> {
  render() {
    const { opinionType, submitting, dispatch, show, stepId, projectId, step, intl } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={() => {
          if (
            // eslint-disable-next-line no-alert
            window.confirm(intl.formatMessage({ id: 'proposal.confirm_close_modal' }))
          ) {
            dispatch(closeOpinionCreateModal());
          }
        }}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="opinion.add_new" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-top bg-info">
            <p>
              <FormattedMessage id="opinion.add_new_infos" />
            </p>
          </div>
          <OpinionCreateForm
            projectId={projectId}
            stepId={stepId}
            step={step}
            opinionType={opinionType}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            onClose={() => {
              dispatch(closeOpinionCreateModal());
            }}
          />
          <SubmitButton
            label="global.create"
            id="confirm-opinion-create"
            isSubmitting={submitting}
            onSubmit={() => {
              dispatch(submit(formName));
            }}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect((state: State, props: Object) => {
  return {
    show: state.opinion.showOpinionCreateModal === props.opinionType.id,
    submitting: isSubmitting(formName)(state),
    step: state.project.projectsById[props.projectId].stepsById[props.stepId],
  };
})(injectIntl(OpinionCreateModal));
