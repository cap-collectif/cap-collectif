// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Modal, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { submit } from 'redux-form';
import { closeOpinionVersionEditModal } from '../../redux/modules/opinion';
import OpinionVersionEditForm, { formName } from './OpinionVersionEditForm';
import type { State } from '../../types';
import type { OpinionVersionEditModal_version } from './__generated__/OpinionVersionEditModal_version.graphql';

type Props = {
  show: boolean,
  dispatch: Function,
  submitting: boolean,
  version: OpinionVersionEditModal_version,
};

class OpinionVersionEditModal extends React.Component<Props> {
  render() {
    const { version, dispatch, submitting, show } = this.props;
    const onClose = () => {
      dispatch(closeOpinionVersionEditModal());
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
          <OpinionVersionEditForm version={version} />
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
              <FormattedMessage id="global.edit" />
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  show: state.opinion.showOpinionVersionEditModal,
  submitting: false,
});

const container = connect(mapStateToProps)(OpinionVersionEditModal);

export default createFragmentContainer(container, {
  version: graphql`
    fragment OpinionVersionEditModal_version on Version {
      ...OpinionVersionEditForm_version
    }
  `,
});
