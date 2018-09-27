// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Modal } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import type { IntlShape } from 'react-intl';
import OpinionCreateForm, { formName } from '../Form/OpinionCreateForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { closeOpinionCreateModal } from '../../../redux/modules/opinion';
import type { State, Dispatch } from '../../../types';
import type { OpinionCreateModal_section } from './__generated__/OpinionCreateModal_section.graphql';
import type { OpinionCreateModal_consultation } from './__generated__/OpinionCreateModal_consultation.graphql';

type Props = {
  intl: IntlShape,
  show: boolean,
  section: OpinionCreateModal_section,
  consultation: OpinionCreateModal_consultation,
  submitting: boolean,
  dispatch: Dispatch,
};

export class OpinionCreateModal extends React.Component<Props> {
  render() {
    const { section, consultation, submitting, dispatch, show, intl } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={() => {
          if (
            // eslint-disable-next-line no-alert
            window.confirm(intl.formatMessage({ id: 'proposal.confirm_close_modal' }))
          ) {
            dispatch(closeOpinionCreateModal());
          }
        }}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="opinion.add_new" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-top bg-info">
            <p>
              <FormattedMessage id="opinion.add_new_infos" />
            </p>
          </div>
          <OpinionCreateForm section={section} consultation={consultation} />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            onClose={() => {
              dispatch(closeOpinionCreateModal());
            }}
          />
          <SubmitButton
            label="global.create"
            id="confirm-opinion-create"
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

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: Object) => ({
  show: state.opinion.showOpinionCreateModal === props.section.id,
  submitting: isSubmitting(formName)(state),
});

const container = connect(mapStateToProps)(injectIntl(OpinionCreateModal));

export default createFragmentContainer(container, {
  section: graphql`
    fragment OpinionCreateModal_section on Section {
      id
      ...OpinionCreateForm_section
    }
  `,
  consultation: graphql`
    fragment OpinionCreateModal_consultation on Consultation {
      ...OpinionCreateForm_consultation
    }
  `,
});
