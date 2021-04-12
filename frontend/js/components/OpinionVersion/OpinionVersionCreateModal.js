// @flow
import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FormattedMessage, useIntl } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { submit } from 'redux-form';
import { closeOpinionVersionCreateModal } from '../../redux/modules/opinion';
import OpinionVersionCreateForm, { formName } from './OpinionVersionCreateForm';
import type { State } from '../../types';
import type { OpinionVersionCreateModal_opinion } from '~relay/OpinionVersionCreateModal_opinion.graphql';

type Props = {
  show: boolean,
  dispatch: Function,
  submitting: boolean,
  opinion: OpinionVersionCreateModal_opinion,
};

const OpinionVersionCreateModal = ({ dispatch, opinion, submitting, show }: Props) => {
  const intl = useIntl();
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
      <Modal.Header closeButton closeLabel={intl.formatMessage({ id: 'close.modal' })}>
        <Modal.Title id="contained-modal-title-lg">
          <FormattedMessage id="opinion.add_new_version" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="modal-top bg-info">
          <FormattedMessage id="opinion.add_new_version_infos" tagName="p" />
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
            <FormattedMessage id="global.send" />
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state: State) => ({
  show: state.opinion.showOpinionVersionCreateModal,
  submitting: state.opinion.isCreatingOpinionVersion,
});

const container = connect<any, any, _, _, _, _>(mapStateToProps)(OpinionVersionCreateModal);
export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionVersionCreateModal_opinion on Opinion {
      ...OpinionVersionCreateForm_opinion
    }
  `,
});
