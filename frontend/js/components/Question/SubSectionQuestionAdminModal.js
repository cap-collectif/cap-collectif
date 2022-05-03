// @flow
import React, { useState } from 'react';
import { Field, getFormSyncErrors, formValueSelector, change, arrayPop } from 'redux-form';
import { Modal } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import type { GlobalState, Dispatch } from '../../types';
import component from '../Form/Field';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import type { Questions } from '~/components/Form/Form.type';
import { ModalContainer } from '~/components/Question/SectionQuestionAdminModal';

type DefaultProps = {|
  +show: boolean,
  +onClose: (isEmpty: boolean) => void,
  +onSubmit: () => void,
  +member: string,
  +isCreating: boolean,
|};

type ParentProps = {|
  +formName: string,
  ...DefaultProps,
|};

type SelectionFormValues = {|
  +id: string,
  +title: string,
  +description: ?string,
  +private: boolean,
  +required: boolean,
|};

type Props = {|
  +disabled: boolean,
  +dispatch: Dispatch,
  +currentSection: SelectionFormValues,
  +questions: Questions,
  +descriptionUsingJoditWysiwyg?: ?boolean,
  ...ParentProps,
|};

const optional = (
  <span className="excerpt">
    {' '}
    <FormattedMessage id="global.optional" />
  </span>
);

const SubSectionQuestionAdminModal = ({
  show,
  onClose,
  member,
  onSubmit,
  isCreating,
  disabled,
  currentSection,
  dispatch,
  formName,
  questions,
  descriptionUsingJoditWysiwyg,
}: Props) => {
  const [initialSectionValues, changeInitialSection] = useState(currentSection);

  // Redux-form does not allow multiple value change at once, therefore the iteration
  const resetSection = (): boolean => {
    for (const [key, value] of Object.entries(initialSectionValues)) {
      dispatch(change(formName, `${member}.${key}`, value));
    }
    return Object.keys(initialSectionValues).length <= 3;
  };

  return (
    <Modal
      show={show}
      backdrop="static"
      aria-labelledby="proposal-form-admin-question-modal-title-lg"
      enforceFocus={false}>
      <ModalContainer>
        <Modal.Header>
          <div className="modal-title">
            <Modal.Title id="proposal-form-admin-question-modal-title-lg">
              <FormattedMessage id={!isCreating ? 'create-sub-section' : 'modify-sub-section'} />
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body>
          <Field
            id={`${member}.title`}
            name={`${member}.title`}
            type="text"
            className="modal-title"
            label={<FormattedMessage id="global.title" />}
            component={component}
          />
          <Field
            id={`${member}.description`}
            name={`${member}.description`}
            type="admin-editor"
            formName={formName}
            fieldUsingJoditWysiwyg={descriptionUsingJoditWysiwyg}
            fieldUsingJoditWysiwygName={`${member}.descriptionUsingJoditWysiwyg`}
            label={
              <span>
                <FormattedMessage id="global.description" />
                {optional}
              </span>
            }
            component={component}
          />
          <div className="regular-weight-field">
            <Field
              id={`${member}.private`}
              normalize={(val: ?boolean) => !!val}
              name={`${member}.private`}
              type="checkbox"
              component={component}>
              <FormattedMessage id="admin.fields.question.private" />
            </Field>
          </div>

          <h4 style={{ fontWeight: 'bold' }}>
            <span>
              <FormattedMessage id="conditional-jumps" />
            </span>
          </h4>

          <div className="movable-element">
            <div className="mb-10">
              <h4 className="panel-title mb-10">
                <FormattedMessage id="always-go-to" />
              </h4>
              <Field
                id={`${member}.alwaysJumpDestinationQuestion.id`}
                name={`${member}.alwaysJumpDestinationQuestion.id`}
                type="select"
                normalize={val => (val !== '' ? val : null)}
                component={component}>
                <option value="" />
                {questions
                  .filter(
                    question => question.id && currentSection && question.id !== currentSection.id,
                  )
                  .map((question, i) => (
                    <option value={question.id} key={question.id}>{`${i + 1}. ${
                      question.title
                    }`}</option>
                  ))}
              </Field>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            onClose={() => {
              const isEmpty = resetSection();
              onClose(isEmpty);
              dispatch(arrayPop(formName, 'questions'));
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
      </ModalContainer>
    </Modal>
  );
};

const mapStateToProps = (state: GlobalState, props: ParentProps) => {
  const selector = formValueSelector(props.formName);
  return {
    currentSection: selector(state, `${props.member}`),
    disabled: getFormSyncErrors(props.formName)(state).questions !== undefined,
    questions: selector(state, 'questions'),
    descriptionUsingJoditWysiwyg: selector(state, `${props.member}.descriptionUsingJoditWysiwyg`),
  };
};

export default connect<any, any, _, _, _, _>(mapStateToProps)(injectIntl(SubSectionQuestionAdminModal));
