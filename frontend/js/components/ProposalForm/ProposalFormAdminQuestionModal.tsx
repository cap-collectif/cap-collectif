import * as React from 'react'
import type { StyledComponent } from 'styled-components'
import styled, { css } from 'styled-components'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Field, formValueSelector, FieldArray, getFormSyncErrors, change, arrayPop } from 'redux-form'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'
import CloseButton from '../Form/CloseButton'
import Toggle from '../Form/Toggle'
import SubmitButton from '../Form/SubmitButton'
import component from '../Form/Field'
import type { GlobalState, Dispatch } from '~/types'
import QuestionChoiceAdminForm from '../QuestionChoices/QuestionChoiceAdminForm'
import QuestionsJumpAdmin from '../QuestionJump/QuestionsJumpAdminForm'
import type { Question } from '~/components/Form/Form.type'
import { ModalContainer } from '~/components/Question/SectionQuestionAdminModal'
import MultipleMajority from '~/components/Form/MultipleMajority/MultipleMajority'
import colors from '~/utils/colors'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'

type ParentProps = {
  dispatch: Dispatch
  show: boolean
  onClose: (isEmpty: boolean) => void
  onSubmit: () => void
  member: string
  isCreating: boolean
  formName: string
}
type Props = ParentProps & {
  type: string
  isRangeBetween: boolean
  validationRuleType: string
  formErrors: Record<string, any>
  currentQuestion: Question
  intl: IntlShape
  isSuperAdmin: boolean
  questionsIds: ReadonlyArray<string>
  descriptionUsingJoditWysiwyg?: boolean | null | undefined
}
type State = {
  initialQuestionValues: Question
}
export const RangeDiv: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  max-width: 320px;
  div:first-child {
    margin-right: 15px;
  }

  .form-group {
    width: 145px;
    input {
      text-align: right;
    }
  }
  .has-error .error-block {
    inline-size: max-content;
  }
  div.has-error:nth-child(2) {
    .error-block {
      display: none;
    }
  }
`
export const MajorityContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  margin-bottom: 20px;

  .preview-text {
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 600;
    color: #7a7a7a;
    margin: 0 0 8px 0;
  }

  .majority-preview {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background-color: ${colors.formBgc};
    padding: 12px;
    ${MAIN_BORDER_RADIUS};
    border: 1px solid #e0e0e0;
    color: ${colors.thirdGray};

    .form-group {
      margin: 0;
      width: 100%;
    }

    .majority-title {
      margin-bottom: 10px;
      font-weight: 600;
      text-align: left;
    }
  }

  .label-container {
    font-size: 10px;
  }
`
// When creating a new question, we can not rely on __typename because it does not exists before creation
// so this is used to determine if we can show the "choices" section of the question form when creating a new one
const multipleChoiceQuestions = ['button', 'radio', 'select', 'checkbox', 'ranking']
export class ProposalFormAdminQuestionModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      initialQuestionValues: props.currentQuestion,
    }
  }

  // Redux-form does not allow multiple value change at once, therefore the iteration
  resetQuestion = (): boolean => {
    const { formName, member, dispatch, questionsIds } = this.props
    const { initialQuestionValues } = this.state

    for (const [key, value] of Object.entries(initialQuestionValues)) {
      if (key === 'jumps' && typeof value === 'object' && Array.isArray(value)) {
        // prevents re-adding a jump related to a deleted question
        const jumps = value.filter(jump => questionsIds.includes(jump.destination.id))
        dispatch(change(formName, `${member}.${key}`, jumps))
      } else {
        dispatch(change(formName, `${member}.${key}`, value))
      }
    }

    return Object.keys(initialQuestionValues).length <= 2
  }

  render() {
    let disabled = false
    const {
      member,
      show,
      isCreating,
      onClose,
      onSubmit,
      formName,
      type,
      isRangeBetween,
      intl,
      validationRuleType,
      currentQuestion,
      formErrors,
      isSuperAdmin,
      dispatch,
    } = this.props

    if (formErrors.questions !== undefined) {
      disabled = true
    }

    const optional = (
      <span className="excerpt">
        {' '}
        <FormattedMessage id="global.optional" />
      </span>
    )
    return (
      <Modal
        show={show}
        backdrop="static"
        onHide={() => {
          const isEmpty = this.resetQuestion()
          onClose(isEmpty)
        }}
        aria-labelledby="proposal-form-admin-question-modal-title-lg"
        enforceFocus={false}
      >
        <ModalContainer>
          <Modal.Header closeButton>
            <div className="modal-title">
              <Modal.Title id="proposal-form-admin-question-modal-title-lg">
                <FormattedMessage id={!isCreating ? 'question_modal.create.title' : 'question_modal.update.title'} />
              </Modal.Title>
            </div>
          </Modal.Header>
          <Modal.Body>
            <Field
              label={<FormattedMessage id="title" />}
              id={`${member}.title`}
              name={`${member}.title`}
              type="text"
              component={component}
            />
            <Field
              label={
                <span>
                  <FormattedMessage id="global.help.text" />
                  {optional}
                </span>
              }
              id={`${member}.helpText`}
              name={`${member}.helpText`}
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
                  <FormattedMessage id="global.description" />
                  {optional}
                </span>
              }
            />
            <Field
              label={intl.formatMessage({
                id: 'admin.fields.question.type',
              })}
              id={`${member}.type`}
              name={`${member}.type`}
              type="select"
              component={component}
              disabled={isCreating}
            >
              <option value="" disabled>
                {intl.formatMessage({
                  id: 'global.select',
                })}
              </option>
              <optgroup
                label={intl.formatMessage({
                  id: 'global.question.types.free',
                })}
              >
                <option value="text">
                  {intl.formatMessage({
                    id: 'global.question.types.text',
                  })}
                </option>
                <option value="textarea">
                  {intl.formatMessage({
                    id: 'global.question.types.textarea',
                  })}
                </option>
                <option value="editor">
                  {intl.formatMessage({
                    id: 'global.question.types.editor',
                  })}
                </option>
                <option value="number">
                  {intl.formatMessage({
                    id: 'admin.fields.validation_rule.number',
                  })}
                </option>
                <option value="medias">
                  {intl.formatMessage({
                    id: 'global.question.types.medias',
                  })}
                </option>
                {isSuperAdmin ? (
                  <>
                    <option value="siret">
                      {intl.formatMessage({
                        id: 'global.question.types.siret',
                      })}
                    </option>
                    <option value="rna">
                      {intl.formatMessage({
                        id: 'global.question.types.rna',
                      })}
                    </option>
                  </>
                ) : null}
              </optgroup>
              <optgroup
                label={intl.formatMessage({
                  id: 'global.question.types.multiple_unique',
                })}
              >
                <option value="button">
                  {intl.formatMessage({
                    id: 'question.types.button',
                  })}
                </option>
                <option value="radio">
                  {intl.formatMessage({
                    id: 'global.question.types.radio',
                  })}
                </option>
                <option value="select">
                  {intl.formatMessage({
                    id: 'global.question.types.select',
                  })}
                </option>
                <option value="majority">
                  {intl.formatMessage({
                    id: 'majority-decision',
                  })}
                </option>
              </optgroup>
              <optgroup
                label={intl.formatMessage({
                  id: 'global.question.types.multiple_multiple',
                })}
              >
                <option value="checkbox">
                  {intl.formatMessage({
                    id: 'global.question.types.checkbox',
                  })}
                </option>
                <option value="ranking">
                  {intl.formatMessage({
                    id: 'global.question.types.ranking',
                  })}
                </option>
              </optgroup>
            </Field>
            {type === 'number' && (
              <>
                <Field
                  id={`${formName}_isRangeBetween`}
                  name={`${member}.isRangeBetween`}
                  component={Toggle}
                  labelSide="LEFT"
                  bold
                  disabled={false}
                  label={<FormattedMessage id="define-range" />}
                  helpText={<FormattedMessage id="range-help" />}
                />
                {isRangeBetween && (
                  <RangeDiv className="d-flex justify-content-between">
                    <Field
                      name={`${member}.rangeMin`}
                      type="number"
                      component={component}
                      label={<FormattedMessage id="minimum-vote" />}
                    />
                    <Field
                      name={`${member}.rangeMax`}
                      type="number"
                      component={component}
                      label={<FormattedMessage id="maximum-vote" />}
                    />
                  </RangeDiv>
                )}
              </>
            )}
            {type === 'button' && (
              <div
                css={css`
                  .toggle-container label:first-of-type {
                    flex: 1;
                    justify-content: space-between;
                  }
                `}
              >
                <Field
                  id="disable-response-colors"
                  icons
                  labelSide="LEFT"
                  component={Toggle}
                  name={`${member}.responseColorsDisabled`}
                  normalize={val => !!val}
                  label={
                    <div>
                      <p className="font-weight-bold">
                        {intl.formatMessage({
                          id: 'disable-responses-colors',
                        })}
                      </p>
                      <p className="excerpt">
                        {intl.formatMessage({
                          id: 'disable-responses-colors-help-text',
                        })}
                      </p>
                    </div>
                  }
                />
                <Field
                  id="enable-group"
                  icons
                  component={Toggle}
                  labelSide="LEFT"
                  name={`${member}.groupedResponsesEnabled`}
                  normalize={val => !!val}
                  label={
                    <div>
                      <p className="font-weight-bold">
                        {intl.formatMessage({
                          id: 'enable-grouped-responses',
                        })}
                      </p>
                      <p className="excerpt">
                        {intl.formatMessage({
                          id: 'enable-grouped-responses-help-text',
                        })}
                      </p>
                    </div>
                  }
                />
              </div>
            )}
            {multipleChoiceQuestions.includes(type) && (
              <div>
                <h4
                  style={{
                    fontWeight: 'bold',
                  }}
                >
                  <FormattedMessage id="admin.fields.reply.responses" />
                </h4>
                <FieldArray
                  name={`${member}.choices`}
                  component={QuestionChoiceAdminForm}
                  formName={formName}
                  oldMember={member}
                  type={type}
                  currentQuestionId={currentQuestion.id}
                />
              </div>
            )}

            {currentQuestion && currentQuestion.type === 'majority' && (
              <MajorityContainer>
                <p className="preview-text">
                  <FormattedMessage id="global.preview" />
                </p>
                <div className="majority-preview">
                  {currentQuestion?.title && <p className="majority-title">{currentQuestion.title}</p>}
                  <MultipleMajority asPreview disabled />
                </div>
              </MajorityContainer>
            )}

            <h4
              style={{
                fontWeight: 'bold',
              }}
            >
              <FormattedMessage id="conditional-jumps" />
            </h4>
            {currentQuestion && currentQuestion.id ? (
              <FieldArray
                name={`${member}.jumps`}
                component={QuestionsJumpAdmin}
                formName={formName}
                oldMember={member}
              />
            ) : (
              <FormattedMessage id="save-question-before-adding-conditional-jump" tagName="p" />
            )}

            <h4
              style={{
                fontWeight: 'bold',
              }}
            >
              <FormattedMessage id="global.options" />
            </h4>
            <div className="regular-weight-field">
              {currentQuestion && currentQuestion.__typename === 'MultipleChoiceQuestion' && (
                <div>
                  <Field
                    id={`${member}.randomQuestionChoices`}
                    name={`${member}.randomQuestionChoices`}
                    type="checkbox"
                    normalize={val => !!val}
                    component={component}
                  >
                    <FormattedMessage id="admin.fields.question.random_question_choices" />
                  </Field>

                  {(currentQuestion.type === 'checkbox' || currentQuestion.type === 'radio') && (
                    <Field
                      id={`${member}.isOtherAllowed`}
                      name={`${member}.isOtherAllowed`}
                      type="checkbox"
                      normalize={val => !!val}
                      component={component}
                    >
                      <FormattedMessage id="admin.fields.question.other_allowed" />
                    </Field>
                  )}
                </div>
              )}
              <Field
                id={`${member}.required`}
                name={`${member}.required`}
                type="checkbox"
                normalize={val => !!val}
                component={component}
              >
                <FormattedMessage id="global.admin.required" />
              </Field>
              <Field
                id={`${member}.private`}
                normalize={val => !!val}
                name={`${member}.private`}
                type="checkbox"
                component={component}
              >
                <FormattedMessage id="admin.fields.question.private" />
              </Field>
              {isSuperAdmin && (
                <Field
                  id={`${member}.hidden`}
                  normalize={val => !!val}
                  name={`${member}.hidden`}
                  type="checkbox"
                  component={component}
                >
                  <FormattedMessage id="hidden-question" />
                </Field>
              )}
            </div>
            {currentQuestion && currentQuestion.__typename === 'MultipleChoiceQuestion' && (
              <div>
                <h4
                  style={{
                    fontWeight: 'bold',
                  }}
                >
                  <span>
                    <FormattedMessage id="admin.fields.question.group_validation" />
                  </span>
                </h4>
                <Field
                  label={<FormattedMessage id="admin.fields.validation_rule.type" />}
                  id={`${member}.validationRule.type`}
                  name={`${member}.validationRule.type`}
                  type="select"
                  component={component}
                >
                  <option value="">
                    {intl.formatMessage({
                      id: 'global.select',
                    })}
                  </option>
                  <option value="MIN">
                    {intl.formatMessage({
                      id: 'questionnaire.validation.type.min',
                    })}
                  </option>
                  <option value="MAX">
                    {intl.formatMessage({
                      id: 'questionnaire.validation.type.max',
                    })}
                  </option>
                  <option value="EQUAL">
                    {intl.formatMessage({
                      id: 'questionnaire.validation.type.equal',
                    })}
                  </option>
                </Field>
                {(validationRuleType === 'MIN' || validationRuleType === 'MAX' || validationRuleType === 'EQUAL') && (
                  <Field
                    label={
                      <span>
                        <FormattedMessage id="admin.fields.validation_rule.number" />
                        {optional}
                      </span>
                    }
                    id={`${member}.validationRule.number`}
                    name={`${member}.validationRule.number`}
                    type="number"
                    component={component}
                    normalize={val => (val && !Number.isNaN(val) ? parseInt(val, 10) : null)}
                  />
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              buttonId={`${member}.cancel`}
              onClose={() => {
                const isEmpty = this.resetQuestion()
                onClose(isEmpty)

                if (!currentQuestion.id) {
                  dispatch(arrayPop(formName, 'questions'))
                }
              }}
            />
            <SubmitButton
              id={`${member}.submit`}
              label="global.validate"
              isSubmitting={false}
              onSubmit={() => {
                this.setState({
                  initialQuestionValues: currentQuestion,
                })
                onSubmit()
              }}
              disabled={disabled}
            />
          </Modal.Footer>
        </ModalContainer>
      </Modal>
    )
  }
}

const mapStateToProps = (state: GlobalState, props: ParentProps) => {
  const selector = formValueSelector(props.formName)
  return {
    currentQuestion: selector(state, `${props.member}`),
    type: selector(state, `${props.member}.type`),
    isRangeBetween: selector(state, `${props.member}.isRangeBetween`),
    validationRuleType: selector(state, `${props.member}.validationRule.type`),
    formErrors: getFormSyncErrors(props.formName)(state),
    isSuperAdmin: state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN'),
  }
}

export default connect<any, any>(mapStateToProps)(injectIntl(ProposalFormAdminQuestionModal))
