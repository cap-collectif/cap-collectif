// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal, Panel, Label } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import OpinionSourceFormInfos from './OpinionSourceFormInfos';
import OpinionSourceFormModalTitle from './OpinionSourceFormModalTitle';
import OpinionSourceForm, { formName } from './OpinionSourceForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { hideSourceCreateModal, hideSourceEditModal } from '../../../redux/modules/opinion';
import type { State } from '../../../types';
import type { OpinionSourceFormModal_source } from './__generated__/OpinionSourceFormModal_source.graphql';
import type { OpinionSourceFormModal_sourceable } from './__generated__/OpinionSourceFormModal_sourceable.graphql';
import RequirementsForm from '../../Requirements/RequirementsForm';

type RelayProps = {|
  source: ?OpinionSourceFormModal_source,
|};

type Props = {|
  ...RelayProps,
  show: boolean,
  sourceable: OpinionSourceFormModal_sourceable,
  submitting: boolean,
  dispatch: Function,
|};

class OpinionSourceFormModal extends React.Component<Props> {
  render() {
    const { submitting, sourceable, source, show, dispatch } = this.props;
    const { step } = sourceable;
    const disabled = step.requirements && !step.requirements.viewerMeetsTheRequirements;
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
          {step && step.requirements.totalCount > 0 && (
            <Panel id="required-conditions" bsStyle="primary">
              <Panel.Heading>
                <FormattedMessage id="requirements" />{' '}
                {step.requirements.viewerMeetsTheRequirements && (
                  <Label bsStyle="primary">
                    <FormattedMessage id="filled" />
                  </Label>
                )}
              </Panel.Heading>
              {!step.requirements.viewerMeetsTheRequirements && (
                <Panel.Body>
                  <p>{step.requirements.reason}</p>
                  <RequirementsForm step={step} stepId={step.id} />
                </Panel.Body>
              )}
            </Panel>
          )}
          <OpinionSourceForm sourceable={sourceable} source={source} />
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
            disabled={disabled}
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
  show:
    (!props.source && state.opinion.showSourceCreateModal) ||
    (props.source && state.opinion.showSourceEditModal === props.source.id) ||
    false,
  submitting: isSubmitting(formName)(state),
});

const container = connect(mapStateToProps)(OpinionSourceFormModal);

export default createFragmentContainer(container, {
  source: graphql`
    fragment OpinionSourceFormModal_source on Source {
      id
      ...OpinionSourceForm_source
    }
  `,
  sourceable: graphql`
    fragment OpinionSourceFormModal_sourceable on Sourceable
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      ...OpinionSourceForm_sourceable
      step {
        id
        ...RequirementsForm_step
        requirements {
          viewerMeetsTheRequirements @include(if: $isAuthenticated)
          reason
          totalCount
        }
      }
    }
  `,
});
