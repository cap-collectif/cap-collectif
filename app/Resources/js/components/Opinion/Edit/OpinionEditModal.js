// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import type { IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import OpinionEditForm, { formName } from '../Form/OpinionEditForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import type { State, Dispatch } from '../../../types';
import { closeOpinionEditModal } from '../../../redux/modules/opinion';

type Props = {
  intl: IntlShape,
  show: boolean,
  opinion: Object,
  step: Object,
  submitting: boolean,
  dispatch: Dispatch,
};

export class OpinionEditModal extends React.Component<Props> {
  render() {
    // eslint-disable-next-line
    const { dispatch, submitting, show, opinion, step, intl } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={() => {
          if (
            // eslint-disable-next-line no-alert
            window.confirm(intl.formatMessage({ id: 'proposal.confirm_close_modal' }))
          ) {
            dispatch(closeOpinionEditModal());
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
          <OpinionEditForm opinion={opinion} step={step} />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            onClose={() => {
              dispatch(closeOpinionEditModal());
            }}
          />
          <SubmitButton
            label="global.edit"
            id="confirm-opinion-update"
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

const mapStateToProps = (state: State, props: Object) => ({
  show: !!(state.opinion.showOpinionEditModal === props.opinion.id),
  submitting: isSubmitting(formName)(state),
  step:
    state.project.currentProjectById &&
    state.project.projectsById[state.project.currentProjectById].steps.filter(
      step => step.type === 'consultation',
    )[0],
});

export default connect(mapStateToProps)(injectIntl(OpinionEditModal));
