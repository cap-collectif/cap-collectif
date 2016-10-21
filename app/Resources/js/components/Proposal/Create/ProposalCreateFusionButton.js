import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { closeCreateFusionModal, openCreateFusionModal } from '../../../redux/modules/proposal';

const ProposalCreateFusionButton = React.createClass({
  propTypes: {
    showModal: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { showModal } = this.props;
    return (
      <div>
        <Button
          id="add-proposal-fusion"
          bsStyle="primary"
        >
          <i className="cap cap-add-1"></i>
          { ` ${this.getIntlMessage('proposal.add')}`}
        </Button>
        <Modal
          animation={false}
          show={showModal}
          onHide={() => this.props.dispatch(closeCreateFusionModal())}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('proposal.add') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ProposalForm
              form={form}
              isSubmitting={isSubmitting}
              categories={categories}
            />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              onClose={() => this.props.dispatch(closeCreateModal())}
            />
            <SubmitButton
              id="confirm-proposal-create"
              isSubmitting={isSubmitting}
              onSubmit={() => this.props.dispatch(submitProposalForm())}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

const mapStateToProps = (state) => ({
  showModal: state.proposal.isOpenFusionModal,
});

export default connect(mapStateToProps)(ProposalCreateFusionButton);
