// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import component from '../Form/Field';

type Props = {
  show: boolean,
  onClose: () => {},
  onSubmit: () => {},
  member: string,
  isCreating: boolean,
};

export class ProposalFormAdminCategoriesStepModal extends React.Component<Props> {
  render() {
    const { member, show, isCreating, onClose, onSubmit } = this.props;
    return (
      <Modal show={show} onHide={onClose} aria-labelledby="report-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title
            id="report-modal-title-lg"
            children={
              <FormattedMessage
                id={!isCreating ? 'category_modal.create.title' : 'category_modal.update.title'}
              />
            }
          />
        </Modal.Header>
        <Modal.Body>
          <Field
            label={<FormattedMessage id="admin.fields.group.title"/>}
            id={`${member}.name`}
            name={`${member}.name`}
            type="text"
            component={component}
          />
          <Field
            id="proposal_media"
            name="media"
            component={component}
            type="image"
            image={proposal && proposal.media ? proposal.media.url : null}
            label={
              <span>
                  <FormattedMessage id="illustration" />
                </span>
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            id="ProposalFormAdminCategoriesStepModal-submit"
            label="global.validate"
            isSubmitting={false}
            onSubmit={onSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect()(ProposalFormAdminCategoriesStepModal);
