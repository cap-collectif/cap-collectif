// @flow
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect, type MapStateToProps } from 'react-redux';
import { submit } from 'redux-form';
import { closeOpinionVersionCreateModal } from '../../redux/modules/opinion';
import OpinionVersionCreateForm, { formName } from './OpinionVersionCreateForm';
import type { State } from '../../types';
import type { OpinionVersionCreateModal_opinion } from './__generated__/OpinionVersionCreateModal_opinion.graphql';

type Props = {
  show: boolean,
  dispatch: Function,
  submitting: boolean,
  opinion: OpinionVersionCreateModal_opinion,
};

class OpinionVersionCreateModal extends React.Component<Props> {
  render() {
    const { dispatch, opinion, submitting, show } = this.props;
    const onClose = () => {
      dispatch(closeOpinionVersionCreateModal());
    };
    return (
      <Modal
        animation={false}
        show={show}
        onHide={onClose}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="opinion.add_new_version" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-top bg-info">
            <p>
              <FormattedMessage id="opinion.add_new_version_infos" />
            </p>
          </div>
          <OpinionVersionCreateForm opinion={opinion} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}>
            <FormattedMessage id="global.cancel" />
          </Button>
          <Button
            disabled={submitting}
            onClick={() => {
              dispatch(submit(formName));
            }}
            bsStyle="primary">
            {submitting ? (
              <FormattedMessage id="global.loading" />
            ) : (
              <FormattedMessage id="global.publish" />
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  show: state.opinion.showOpinionVersionCreateModal,
  submitting: state.opinion.isCreatingOpinionVersion,
});

const container = connect(mapStateToProps)(OpinionVersionCreateModal);
export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionVersionCreateModal_opinion on Opinion {
      ...OpinionVersionCreateForm_opinion
    }
  `,
});
