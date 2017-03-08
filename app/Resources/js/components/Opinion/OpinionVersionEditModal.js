// @flow
import React, { PropTypes } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { submit } from 'redux-form';
import { closeOpinionVersionEditModal } from '../../redux/modules/opinion';
import OpinionVersionEditForm, { formName } from './OpinionVersionEditForm';
import type { State } from '../../types';

const OpinionVersionEditModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { dispatch, submitting, show } = this.props;
    const onClose = () => { dispatch(closeOpinionVersionEditModal()); };
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
            <OpinionVersionEditForm />
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
                : this.getIntlMessage('global.edit')
              }
            </Button>
          </Modal.Footer>
        </Modal>
    );
  },
});

const mapStateToProps = (state: State) => ({
  show: state.opinion.showOpinionVersionEditModal,
  submitting: state.opinion.isEditingOpinionVersion,
});

export default connect(mapStateToProps)(OpinionVersionEditModal);
