// @flow
import * as React from 'react';
import { Field, getFormSyncErrors } from 'redux-form';
import { Modal } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import type { GlobalState } from '../../types';
import component from '../Form/Field';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';

type DefaultProps = {
  show: boolean,
  onClose: () => void,
  onSubmit: () => void,
  member: string,
  isCreating: boolean,
};

type ParentProps = DefaultProps & {
  formName: string,
};

type Props = DefaultProps & {
  disabled: boolean,
};

const optional = (
  <span className="excerpt">
    {' '}
    <FormattedMessage id="global.form.optional" />
  </span>
);

const SectionQuestionAdminModal = (props: Props) => {
  const { show, onClose, member, onSubmit, isCreating, disabled } = props;

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

const mapStateToProps = (state: GlobalState, props: ParentProps) => ({
  disabled: getFormSyncErrors(props.formName)(state).questions !== undefined,
});

export default connect(mapStateToProps)(injectIntl(SectionQuestionAdminModal));
