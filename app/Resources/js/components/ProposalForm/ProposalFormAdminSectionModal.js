// @flow
import * as React from 'react';
import { Field, getFormSyncErrors } from 'redux-form';
import { Modal } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import type { GlobalState } from '../../types';
import component from '../Form/Field';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';

type ParentProps = {
  show: boolean,
  onClose: () => void,
  onSubmit: () => void,
  member: string,
  isCreating: boolean,
  formName: string,
};

type Props = {
  show: boolean,
  onClose: () => void,
  onSubmit: () => void,
  member: string,
  isCreating: boolean,
  formName: string,
  formErrors: Object,
};

const optional = (
  <span className="excerpt">
    {' '}
    <FormattedMessage id="global.form.optional" />
  </span>
);

const ProposalFormAdminSectionModal = (props: Props) => {
  const { show, onClose, member, onSubmit, isCreating, formErrors } = props;

  let disabled = false;

  if (formErrors.questions !== undefined) {
    disabled = true;
  }

  return (
    <Modal show={show} aria-labelledby="proposal-form-admin-question-modal-title-lg">
      <Modal.Header>
        <Modal.Title
          id="proposal-form-admin-question-modal-title-lg"
          children={
            <FormattedMessage id={!isCreating ? 'section_modal.create.title' : 'modify-section'} />
          }
        />
      </Modal.Header>
      <Modal.Body>
        <Field
          id={`${member}.title`}
          name={`${member}.title`}
          type="text"
          label={<FormattedMessage id="admin.fields.group.title" />}
          component={component}
        />
        <Field
          id={`${member}.description`}
          name={`${member}.description`}
          type="editor"
          label={
            <span>
              <FormattedMessage id="proposal.description" />
              {optional}
            </span>
          }
          component={component}
        />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={onClose} />
        <SubmitButton
          label="global.validate"
          isSubmitting={false}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState, props: ParentProps) => ({
  formErrors: getFormSyncErrors(props.formName)(state),
});

export default connect(mapStateToProps)(injectIntl(ProposalFormAdminSectionModal));
