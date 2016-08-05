import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';

import OpinionSourceStore from '../../../stores/OpinionSourceStore';
import OpinionSourceFormInfos from './OpinionSourceFormInfos';
import OpinionSourceFormModalTitle from './OpinionSourceFormModalTitle';
import OpinionSourceForm from './OpinionSourceForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import OpinionSourceActions from '../../../actions/OpinionSourceActions';

const OpinionSourceFormModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    source: PropTypes.object,
    onClose: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleFailure() {
    this.setState({ isSubmitting: false });
  },

  handleSubmit() {
    this.setState({ isSubmitting: true });
  },

  handleSubmitSuccess() {
    this.props.onClose();
    this.setState({ isSubmitting: false });
    OpinionSourceActions.load(OpinionSourceStore.opinion, 'last');
  },

  render() {
    const { isSubmitting } = this.state;
    const { source, onClose, show } = this.props;
    const action = source ? 'update' : 'create';
    return (
      <Modal
        animation={false}
        show={show}
        onHide={onClose.bind(null, this)}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton>
          <OpinionSourceFormModalTitle action={action} />
        </Modal.Header>
        <Modal.Body>
          <OpinionSourceFormInfos action={action} />
          <OpinionSourceForm
            opinion={OpinionSourceStore.opinion}
            source={source}
            isSubmitting={isSubmitting}
            onValidationFailure={this.handleFailure.bind(null, this)}
            onSubmitSuccess={this.handleSubmitSuccess.bind(null, this)}
            onSubmitFailure={this.handleFailure.bind(null, this)}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
            <SubmitButton
              id={`confirm-opinion-source-${action}`}
              label={action === 'create' ? 'global.publish' : 'global.edit'}
              isSubmitting={isSubmitting}
              onSubmit={this.handleSubmit.bind(null, this)}
            />
        </Modal.Footer>
      </Modal>
    );
  },

});

export default OpinionSourceFormModal;
