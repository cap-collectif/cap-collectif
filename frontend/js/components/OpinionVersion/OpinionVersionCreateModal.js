// @flow
import * as React from 'react';
import { Modal, Button, Panel, Label } from 'react-bootstrap';
import { FormattedMessage, useIntl } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { submit } from 'redux-form';
import { closeOpinionVersionCreateModal } from '../../redux/modules/opinion';
import OpinionVersionCreateForm, { formName } from './OpinionVersionCreateForm';
import type { State } from '../../types';
import type { OpinionVersionCreateModal_opinion } from '~relay/OpinionVersionCreateModal_opinion.graphql';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import RequirementsFormLegacy from '~/components/Requirements/RequirementsFormLegacy';

type Props = {
  show: boolean,
  dispatch: Function,
  submitting: boolean,
  opinion: OpinionVersionCreateModal_opinion,
};

const OpinionVersionCreateModal = ({ dispatch, opinion, submitting, show }: Props) => {
  const intl = useIntl();
  const disabled =
    opinion.step.requirements && !opinion.step.requirements.viewerMeetsTheRequirements;

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
        {opinion.step && opinion.step.requirements.totalCount > 0 && (
          <Panel id="required-conditions" bsStyle="primary">
            <Panel.Heading>
              <FormattedMessage id="requirements" />{' '}
              {opinion.step.requirements.viewerMeetsTheRequirements && (
                <Label bsStyle="primary">
                  <FormattedMessage id="filled" />
                </Label>
              )}
            </Panel.Heading>
            {!opinion.step.requirements.viewerMeetsTheRequirements && (
              <Panel.Body>
                <WYSIWYGRender value={opinion.step.requirements.reason} />
                <RequirementsFormLegacy step={opinion.step} stepId={opinion.step.id} />
              </Panel.Body>
            )}
          </Panel>
        )}
        <OpinionVersionCreateForm opinion={opinion} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>
          <FormattedMessage id="global.cancel" />
        </Button>
        <Button
          disabled={submitting || disabled}
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
      step {
        id
        ...RequirementsFormLegacy_step @arguments(isAuthenticated: $isAuthenticated)

        requirements {
          viewerMeetsTheRequirements @include(if: $isAuthenticated)
          reason
          totalCount
        }
      }
    }
  `,
});
