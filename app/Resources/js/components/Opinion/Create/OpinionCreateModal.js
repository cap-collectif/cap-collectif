import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import OpinionCreateForm from '../Form/OpinionCreateForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import Fetcher from '../../../services/Fetcher';

const OpinionCreateModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    projectId: PropTypes.string.isRequired,
    stepId: PropTypes.number.isRequired,
    step: PropTypes.object.isRequired,
    opinionTypeId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
      opinionType: { appendixTypes: [] },
    };
  },

  componentDidMount() {
    const { opinionTypeId } = this.props;// Todo: remove this, everything should be passed as props
    Fetcher
      .get(`/opinion_types/${opinionTypeId}`)
      .then((data) => {
        this.setState({ opinionType: data });
      });
  },

  handleSubmit() {
    if (this.form.isValid()) {
      this.form.submit();
      this.setState({ isSubmitting: true });
    }
  },

  handleSubmitSuccess() {
    const { onClose } = this.props;
    this.setState({ isSubmitting: false });
    onClose();
  },

  stopSubmit() {
    this.setState({ isSubmitting: false });
  },

  render() {
    const { isSubmitting, opinionType } = this.state;
    const { onClose, show, stepId, projectId, step } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={() => {
          if (window.confirm(this.getIntlMessage('proposal.confirm_close_modal'))) { // eslint-disable-line no-alert
            onClose();
          }
        }}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            { this.getIntlMessage('opinion.add_new') }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-top bg-info">
            <p>
              { this.getIntlMessage('opinion.add_new_infos') }
            </p>
          </div>
          <OpinionCreateForm
            ref={c => this.form = c}
            projectId={projectId}
            stepId={stepId}
            step={step}
            opinionType={opinionType}
            onSubmitSuccess={this.handleSubmitSuccess}
            onFailure={this.stopSubmit}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            label="global.create"
            id="confirm-opinion-create"
            isSubmitting={isSubmitting}
            onSubmit={this.handleSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  },

});

export default connect(
  (state, props) => {
    return {
      step: state.project.projectsById[props.projectId].steps.filter(step => step.id === props.stepId)[0],
    };
  }, null, null, { withRef: true },
)(OpinionCreateModal);
