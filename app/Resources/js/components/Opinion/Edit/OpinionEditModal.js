// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { injectIntl, FormattedMessage, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import OpinionEditForm, { formName } from '../Form/OpinionEditForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import type { State, Dispatch } from '../../../types';
import { closeOpinionEditModal } from '../../../redux/modules/opinion';
import type { OpinionEditModal_opinion } from '~relay/OpinionEditModal_opinion.graphql';

type RelayProps = {|
  opinion: OpinionEditModal_opinion,
|};

type Props = {|
  ...RelayProps,
  intl: IntlShape,
  show: boolean,
  submitting: boolean,
  dispatch: Dispatch,
|};

export class OpinionEditModal extends React.Component<Props & { intl: IntlShape }> {
  render() {
    // eslint-disable-next-line
    const { dispatch, submitting, show, opinion, intl } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={() => {
          if (
            // eslint-disable-next-line no-alert
            window.confirm(intl.formatMessage({ id: 'proposal.confirm_close_modal' }))
          ) {
            dispatch(closeOpinionEditModal());
          }
        }}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="global.edit" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OpinionEditForm opinion={opinion} />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            onClose={() => {
              dispatch(closeOpinionEditModal());
            }}
          />
          <SubmitButton
            label="global.edit"
            id="confirm-opinion-update"
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

const mapStateToProps = (state: State, props: RelayProps) => ({
  show: !!(state.opinion.showOpinionEditModal === props.opinion.id),
  submitting: isSubmitting(formName)(state),
});

const connector = connect(mapStateToProps);

const container = connector(injectIntl(OpinionEditModal));

export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionEditModal_opinion on Opinion {
      ...OpinionEditForm_opinion
      id
    }
  `,
});
