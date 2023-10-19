import * as React from 'react'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Field, formValueSelector } from 'redux-form'
import { useIntl } from 'react-intl'
import CloseButton from '../Form/CloseButton'
import SubmitButton from '../Form/SubmitButton'
import component from '../Form/Field'
import type { Dispatch, GlobalState } from '~/types'
import { ModalContainer } from '~/components/Question/SectionQuestionAdminModal'

type Props = {
  show: boolean
  onClose: () => void
  onSubmit: () => void
  member: string
  isCreating: boolean
  kind: string
  dispatch: Dispatch
  formName: string
  type: string
  descriptionUsingJoditWysiwyg?: boolean | null | undefined
}
export const QuestionChoiceAdminModal = ({ show, onClose, onSubmit, member, isCreating, type }: Props) => {
  const intl = useIntl()
  const optional = (
    <span className="excerpt">
      {' '}
      {intl.formatMessage({
        id: 'global.optional',
      })}
    </span>
  )
  return (
    <Modal
      show={show}
      onHide={onClose}
      backdrop="static"
      aria-labelledby="proposal-form-admin-question-modal-title-lg"
      id="proposal-form-admin-question-modal"
      enforceFocus={false}
    >
      <ModalContainer>
        <Modal.Header closeButton>
          <div className="modal-title">
            <Modal.Title id="proposal-form-admin-question-modal-title-lg">
              {intl.formatMessage({
                id: !isCreating ? 'global-add-answer' : 'global-edit-answer',
              })}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body>
          <Field
            label={intl.formatMessage({
              id: 'global.title',
            })}
            id={`${member}.title`}
            name={`${member}.title`}
            type="text"
            component={component}
          />
          <Field
            name={`${member}.description`}
            component={component}
            type="admin-editor"
            id={`${member}.description`}
            label={
              <span>
                {intl.formatMessage({
                  id: 'global.description',
                })}
                {optional}
              </span>
            }
          />
          {type === 'button' && (
            <Field
              label={intl.formatMessage({
                id: 'global.color',
              })}
              id={`${member}.color`}
              name={`${member}.color`}
              type="color-picker"
              component={component}
            />
          )}
          {(type === 'radio' || type === 'checkbox' || type === 'ranking') && (
            <Field
              id="proposal_media"
              name={`${member}.image`}
              component={component}
              type="image"
              label={
                <span>
                  {intl.formatMessage({
                    id: 'proposal.media',
                  })}
                  {optional}
                </span>
              }
              help={intl.formatMessage({
                id: 'global.image_uploader.image.dropzone',
              })}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton label="global.validate" isSubmitting={false} onSubmit={onSubmit} id="question-choice-submit" />
        </Modal.Footer>
      </ModalContainer>
    </Modal>
  )
}

const mapStateToProps = (state: GlobalState, props) => {
  const selector = formValueSelector(props.formName)
  return {
    kind: selector(state, `${props.member}.kind`),
  }
}

export default connect<any, any>(mapStateToProps)(QuestionChoiceAdminModal)
