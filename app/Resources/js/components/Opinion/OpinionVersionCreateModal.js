// @flow
import React, { PropTypes } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { submit } from 'redux-form';
import { closeOpinionVersionCreateModal } from '../../redux/modules/opinion';
import OpinionVersionCreateForm, { formName } from './OpinionVersionCreateForm';
import type { State } from '../../types';

const OpinionVersionCreateModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { dispatch, submitting, show } = this.props;
    const onClose = () => { dispatch(closeOpinionVersionCreateModal()); };
    return (
        <Modal
          animation={false}
          show={show}
          onHide={onClose}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('opinion.add_new_version') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-top bg-info">
              <p>
                { this.getIntlMessage('opinion.add_new_version_infos') }
              </p>
            </div>
            <OpinionVersionCreateForm />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={onClose}>
              {this.getIntlMessage('global.cancel')}
            </Button>
            <Button
              disabled={submitting}
              onClick={() => { dispatch(submit(formName)); }}
              bsStyle="primary"
            >
              {
                submitting
                ? this.getIntlMessage('global.loading')
                : this.getIntlMessage('global.publish')
              }
            </Button>
          </Modal.Footer>
        </Modal>
    );
  },
});

const mapStateToProps = (state: State) => ({
  show: state.opinion.showOpinionVersionCreateModal,
  submitting: state.opinion.isCreatingOpinionVersion,
});

export default connect(mapStateToProps)(OpinionVersionCreateModal);
