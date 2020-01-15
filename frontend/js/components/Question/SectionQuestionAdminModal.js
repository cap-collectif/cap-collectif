// @flow
import React, { useState } from 'react';
import { Field, getFormSyncErrors, formValueSelector, change } from 'redux-form';
import { Modal } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import type { GlobalState, Dispatch } from '../../types';
import component from '../Form/Field';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';

type DefaultProps = {
  show: boolean,
  onClose: (isEmpty: boolean) => void,
  onSubmit: () => void,
  member: string,
  isCreating: boolean,
};

type ParentProps = DefaultProps & {
  formName: string,
};

type Props = DefaultProps & {
  disabled: boolean,
  dispatch: Dispatch,
  currentSection: any,
  formName: string,
};

const optional = (
  <span className="excerpt">
    {' '}
    <FormattedMessage id="global.optional" />
  </span>
);

const SectionQuestionAdminModal = ({
  show,
  onClose,
  member,
  onSubmit,
  isCreating,
  disabled,
  currentSection,
  dispatch,
  formName,
}: Props) => {
  const [initialSectionValues, changeInitialSection] = useState(currentSection);

  // Redux does not allow multiple value change at once, therefore the iteration
  const resetSection = (): boolean => {
    for (const [key, value] of Object.entries(initialSectionValues)) {
      dispatch(change(formName, `${member}.${key}`, value));
    }
    return Object.keys(initialSectionValues).length <= 3;
  };

  return (
    <Modal show={show} aria-labelledby="proposal-form-admin-question-modal-title-lg">
      <Modal.Header>
        <Modal.Title
          id="proposal-form-admin-question-modal-title-lg"
          children={<FormattedMessage id={!isCreating ? 'create-section' : 'modify-section'} />}
        />
      </Modal.Header>
      <Modal.Body>
        <Field
          id={`${member}.title`}
          name={`${member}.title`}
          type="text"
          label={<FormattedMessage id="global.title" />}
          component={component}
        />
        <Field
          id={`${member}.description`}
          name={`${member}.description`}
          type="admin-editor"
          label={
            <span>
              <FormattedMessage id="global.description" />
              {optional}
            </span>
          }
          component={component}
        />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton
          onClose={() => {
            const isEmpty = resetSection();
            onClose(isEmpty);
          }}
        />
        <SubmitButton
          id={`${member}.submit`}
          label="global.validate"
          isSubmitting={false}
          onSubmit={() => {
            changeInitialSection(currentSection);
            onSubmit();
          }}
          disabled={disabled || false}
        />
      </Modal.Footer>
    </Modal>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    dispatch,
  };
};

const mapStateToProps = (state: GlobalState, props: ParentProps) => {
  const selector = formValueSelector(props.formName);
  return {
    currentSection: selector(state, `${props.member}`),
    disabled: getFormSyncErrors(props.formName)(state).questions !== undefined,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(SectionQuestionAdminModal));
