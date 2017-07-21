// @flow
import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import OpinionCreateForm, { formName } from '../Form/OpinionCreateForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { closeOpinionCreateModal } from '../../../redux/modules/opinion';
import type { State } from '../../../types';

export const OpinionCreateModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    projectId: PropTypes.string.isRequired,
    stepId: PropTypes.string.isRequired,
    step: PropTypes.object.isRequired,
    opinionType: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const {
      opinionType,
      submitting,
      dispatch,
      show,
      stepId,
      projectId,
      step,
    } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={() => {
          if (
            window.confirm(this.getIntlMessage('proposal.confirm_close_modal')) // eslint-disable-line no-alert
          ) {
            dispatch(closeOpinionCreateModal());
          }
        }}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            {this.getIntlMessage('opinion.add_new')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-top bg-info">
            <p>
              {this.getIntlMessage('opinion.add_new_infos')}
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
  },
});

export default connect((state: State, props: Object) => {
  return {
    show: state.opinion.showOpinionCreateModal === props.opinionType.id,
    submitting: isSubmitting(formName)(state),
    step: state.project.projectsById[props.projectId].stepsById[props.stepId],
  };
})(OpinionCreateModal);
