// @flow
import React, { PropTypes } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { closeOpinionVersionCreateModal } from '../../redux/modules/opinion';
import OpinionVersionCreateForm from './OpinionVersionCreateForm';

const OpinionVersionCreateModal = React.createClass({
  propTypes: {
    className: PropTypes.string,
    show: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    style: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { dispatch, submitting, show } = this.props;
    const onClose = () => { dispatch(closeOpinionVersionCreateModal()); };
    return (
        <Modal
          {...this.props}
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
              // onClick={() => { dispatch(submit('')) }}
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

const mapStateToProps = state => ({
  show: state.opinion.showOpinionVersionCreateModal,
  submitting: false,
});

export default connect(mapStateToProps)(OpinionVersionCreateModal);
