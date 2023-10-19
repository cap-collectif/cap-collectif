import { $PropertyType } from 'utility-types'
import * as React from 'react'
import { connect } from 'react-redux'
import { change, Field, FieldArray, formValueSelector } from 'redux-form'
import { FormattedMessage } from 'react-intl'
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup, Button } from 'react-bootstrap'
import { get } from 'lodash'
import QuestionJumpConditionsAdminForm from './QuestionJumpConditionsAdminForm'
import type { GlobalState } from '~/types'
import component from '../Form/Field'
import type { responsesHelper_adminQuestion } from '~relay/responsesHelper_adminQuestion.graphql'
import type { QuestionnaireAdminConfigurationForm_questionnaire } from '~relay/QuestionnaireAdminConfigurationForm_questionnaire.graphql'

type ParentProps = {
  formName: string
  oldMember: string
}
type Props = ReduxFormFormProps &
  ParentProps & {
    fields: {
      length: number
      map: (...args: Array<any>) => any
      remove: (...args: Array<any>) => any
      push: (...args: Array<any>) => any
    }
    jumps: $PropertyType<responsesHelper_adminQuestion, 'jumps'>
    questions: $PropertyType<QuestionnaireAdminConfigurationForm_questionnaire, 'questions'>
    formName: string
    currentQuestion: Record<string, any>
  }

const QuestionsJumpAdminForm = ({ fields, questions, oldMember, formName, currentQuestion, dispatch }: Props) => {
  const firstMultipleChoiceQuestion = questions.find(question => question.__typename === 'MultipleChoiceQuestion')
  const isMultipleQuestion = currentQuestion.__typename === 'MultipleChoiceQuestion'

  const addDefaultJump = () => {
    const destinationQuestion = questions[0].id !== currentQuestion.id ? questions[0] : questions[1] || null
    const destinationQuestionIndex = questions.findIndex(q => q.id === destinationQuestion?.id)
    fields.push({
      origin: {
        id: currentQuestion.id,
      },
      conditions: [
        {
          question: {
            id: isMultipleQuestion
              ? currentQuestion.id
              : firstMultipleChoiceQuestion
              ? firstMultipleChoiceQuestion.id
              : null,
          },
          value: isMultipleQuestion
            ? currentQuestion.choices[0]
            : firstMultipleChoiceQuestion
            ? firstMultipleChoiceQuestion.choices && firstMultipleChoiceQuestion.choices[0]
            : null,
          operator: 'IS',
        },
      ],
      destination: {
        id: destinationQuestion?.id ?? null,
        title: destinationQuestion?.title ?? null,
      },
    })

    if (destinationQuestion && destinationQuestionIndex) {
      dispatch(
        change(formName, `questions[${destinationQuestionIndex}].destinationJumps`, [
          ...destinationQuestion.destinationJumps,
          {
            origin: {
              id: currentQuestion.id,
              title: currentQuestion.title,
            },
          },
        ]),
      )
    }
  }

  const onJumpRemove = (index: number, member: string): void => {
    fields.remove(index)
    const jump = get(
      {
        questions,
      },
      member,
    )

    if (jump.conditions.length === 1) {
      const destinationId = jump.destination.id
      const destination = questions.find(q => q.id === destinationId)
      const destinationIndex = questions.findIndex(q => q.id === destinationId)
      const updatedDestinationJumps = destination?.destinationJumps?.filter(j => j.origin.id !== currentQuestion.id)
      dispatch(change(formName, `questions[${destinationIndex}].destinationJumps`, updatedDestinationJumps))
    }
  }

  return (
    <div className="form-group" id="questions_choice_panel_personal">
      <ListGroup>
        {fields.map((member, index) => (
          <div className="panel-custom panel panel-default" key={member}>
            <div className="panel-heading">
              <i
                className="cap cap-android-menu"
                style={{
                  color: '#0388CC',
                  fontSize: '20px',
                }}
              />
              <h3 className="panel-title">
                <FormattedMessage id="answering-this-question" />
              </h3>
              <button
                type="button"
                style={{
                  border: 'none',
                  fontSize: '20px',
                  backgroundColor: '#f5f5f5',
                }}
                onClick={() => onJumpRemove(index, member)}
              >
                X
              </button>
            </div>
            <div className="panel-body">
              <FieldArray
                name={`${member}.conditions`}
                component={QuestionJumpConditionsAdminForm}
                formName={formName}
                member={member}
              />
            </div>
          </div>
        ))}
      </ListGroup>
      <Button
        id="add-conditional-jump-button"
        bsStyle="primary"
        className="btn--outline box-content__toolbar"
        onClick={() => addDefaultJump()}
      >
        <i className="fa fa-plus-circle" /> <FormattedMessage id="global.add" />
      </Button>
      <div className="movable-element">
        <div className="mb-10">
          <h4 className="panel-title">
            <FormattedMessage id={fields && fields.length === 0 ? 'always-go-to' : 'jump-other-goto'} />
          </h4>
          <Field
            id={`${oldMember}.alwaysJumpDestinationQuestion.id`}
            name={`${oldMember}.alwaysJumpDestinationQuestion.id`}
            type="select"
            normalize={val => (val !== '' ? val : null)}
            component={component}
          >
            <option value="" />
            {questions
              .filter(question => {
                // We should not display the always jump of a question when it is referecing itself
                // because an always jump could not redirect to itself
                return question.id && currentQuestion && question.id !== currentQuestion.id
              })
              .map((question, i) => (
                <option value={question.id} key={question.id}>{`${i + 1}. ${question.title}`}</option>
              ))}
          </Field>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state: GlobalState, props: ParentProps) => {
  const selector = formValueSelector(props.formName)
  return {
    currentQuestion: selector(state, `${props.oldMember}`),
    questions: selector(state, 'questions'),
  }
}

export default connect<any, any>(mapStateToProps)(QuestionsJumpAdminForm)
