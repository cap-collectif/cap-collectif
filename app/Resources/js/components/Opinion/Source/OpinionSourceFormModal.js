// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect, type MapStateToProps } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import OpinionSourceStore from '../../../stores/OpinionSourceStore';
import OpinionSourceFormInfos from './OpinionSourceFormInfos';
import OpinionSourceFormModalTitle from './OpinionSourceFormModalTitle';
import OpinionSourceForm, { formName } from './OpinionSourceForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { hideSourceCreateModal, hideSourceEditModal } from '../../../redux/modules/opinion';
import type { State } from '../../../types';
import type { OpinionSourceFormModal_source } from './__generated__/OpinionSourceFormModal_source.graphql';

type Props = {
  show: boolean,
  source?: OpinionSourceFormModal_source,
  submitting: boolean,
  dispatch: Function,
};

class OpinionSourceFormModal extends React.Component<Props> {
  render() {
    const { submitting, source, show, dispatch } = this.props;
    const action = source ? 'update' : 'create';
    return (
      <Modal
        animation={false}
        show={show}
        onHide={() => {
          if (action === 'update') {
            dispatch(hideSourceEditModal());
          } else {
            dispatch(hideSourceCreateModal());
          }
        }}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <OpinionSourceFormModalTitle action={action} />
        </Modal.Header>
        <Modal.Body>
          <OpinionSourceFormInfos action={action} />
          <OpinionSourceForm opinion={OpinionSourceStore.opinion} source={source} />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            onClose={() => {
              if (action === 'update') {
                dispatch(hideSourceEditModal());
              } else {
                dispatch(hideSourceCreateModal());
              }
            }}
          />
          <SubmitButton
            id={`confirm-opinion-source-${action}`}
            label={action === 'create' ? 'global.publish' : 'global.edit'}
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

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props) => ({
  show:
    (!props.source && state.opinion.showSourceCreateModal) ||
    (props.source && state.opinion.showSourceEditModal === props.source.id) ||
    false,
  submitting: isSubmitting(formName)(state),
});

const container = connect(mapStateToProps)(OpinionSourceFormModal);
export default createFragmentContainer(
  container,
  graphql`
    fragment OpinionSourceFormModal_source on Source {
      id
    }
  `,
);
