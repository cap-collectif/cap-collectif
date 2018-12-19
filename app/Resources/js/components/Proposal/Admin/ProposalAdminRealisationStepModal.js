// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import component from '../../Form/Field';

type Props = {
  show: boolean,
  onClose: Function,
  member: string,
  isCreating: boolean,
};

export class ProposalAdminRealisationStepModal extends React.Component<Props> {
  render() {
    const { member, show, isCreating, onClose } = this.props;
    return (
      <Modal show={show} onHide={onClose} aria-labelledby="report-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title
            id="report-modal-title-lg"
            children={
              <FormattedMessage
                id={
                  isCreating
                    ? 'realisation_step_modal.create.title'
                    : 'realisation_step_modal.update.title'
                }
              />
            }
          />
        </Modal.Header>
        <Modal.Body>
          <Field
            label="Titre"
            id={`${member}.title`}
            name={`${member}.title`}
            type="text"
            component={component}
          />
          <Field
            timeFormat={false}
            label="Date de début"
            id={`${member}.startAt`}
            name={`${member}.startAt`}
            type="datetime"
            component={component}
          />
          <Field
            timeFormat={false}
            label={
              <span>
                <FormattedMessage id="global.endDate" />{' '}
                <span className="excerpt">
                  <FormattedMessage id="global.form.optional" />
                </span>
              </span>
            }
            id={`${member}.endAt`}
            name={`${member}.endAt`}
            type="datetime"
            component={component}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton label="global.validate" isSubmitting={false} onSubmit={onClose} />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect()(ProposalAdminRealisationStepModal);
