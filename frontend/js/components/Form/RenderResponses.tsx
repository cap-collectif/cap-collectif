import { $Values } from 'utility-types'
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import type { FieldArrayProps } from 'redux-form'
import { Field } from 'redux-form'
import isEqual from 'lodash/isEqual'
import type { IntlShape } from 'react-intl'
import { fetchQuery_DEPRECATED } from 'react-relay'
import { TYPE_FORM, QUESTION_TYPE_WITH_JUMP } from '~/constants/FormConstants'
import type { Question, Questions, QuestionType, ResponsesInReduxForm } from '~/components/Form/Form.type'
import getRequiredFieldIndicationStrategy from '~/utils/form/getRequiredFieldIndicationStrategy'
import resetNotAvailableQuestions from '~/utils/form/resetNotAvailableQuestions'
import isQuestionnaire from '~/utils/isQuestionnaire'
import QuestionRender from '~ui/Form/Question/Question'
import PrivateBox from '~ui/Boxes/PrivateBox'
import { cleanDomId } from '~/utils/string'
import component from '~/components/Form/Field'
import ConditionalJumps from '~/utils/ConditionalJumps'
import environment from '~/createRelayEnvironment'
import select from '~/components/Form/Select'
import getAvailableQuestionsIds from '~/utils/form/getAvailableQuestionsIds'
import { MULTIPLE_QUESTION_CHOICES_SEARCH_QUERY } from '@shared/utils/responsesHelper'
import Section from '~/components/Form/Section/Section'
import AppBox from '~ui/Primitives/AppBox'
import { getAvailabeQuestionsCacheKey } from '~/utils/questionsCacheKey'

const BoxWithMarge = styled(AppBox).attrs<{
  isQuestionnaire: boolean
}>({
  className: 'box-with-marge',
})`
  padding-left: ${props => (props.isQuestionnaire ? '32px' : '0')};
  padding-right: ${props => (props.isQuestionnaire ? '32px' : '0')};
  margin-bottom: 32px !important;
  .form-group {
    margin-bottom: 0px !important;
  }
`

const mapQuestionChoicesToOptions = (question: Question) =>
  question.choices &&
  question.choices.edges &&
  question.choices.edges
    .filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean)
    .map(choice => ({
      value: choice.title,
      label: choice.title,
    }))

const formattedChoicesInField = field =>
  field.choices &&
  field.choices.edges &&
  field.choices.edges
    .filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean)
    .map(choice => ({
      id: choice.id,
      label: choice.title,
      description: choice.description,
      color: choice.color,
      image: choice.image,
    }))

const MULTIPLE_QUESTION_CHOICES_COUNT_TRIGGER_SEARCH = 20

const availableQuestionsNotInitialize = availableQuestions => availableQuestions.length === 0

const shouldNotBeRender = (isAvailableQuestion: boolean, isModePrint: boolean) => !isAvailableQuestion && !isModePrint

const RenderResponses = ({
  fields,
  questions,
  responses,
  intl,
  form,
  change,
  disabled,
  typeForm = TYPE_FORM.DEFAULT,
  availableQuestions: oldAvailableQuestions = [],
  divClassName = '',
  memoize,
  unstable__enableCapcoUiDs,
  memoizeId,
}: FieldArrayProps & {
  questions: Questions
  responses: ResponsesInReduxForm
  change: (field: string, value: any) => void
  form: string
  intl: IntlShape
  disabled: boolean
  typeForm: $Values<typeof TYPE_FORM>
  availableQuestions: Array<string>
  divClassName?: string
  memoize: any
  unstable__enableCapcoUiDs?: boolean
  memoizeId?: string
}) => {
  const [lastQuestionType, setLastQuestionType] = useState<QuestionType | null | undefined>(null)
  const [isModePrint, setModePrint] = useState<boolean>(false)
  const strategy = getRequiredFieldIndicationStrategy(questions)
  // jump is ONLY on 'QUESTION_TYPE_WITH_JUMP' THEN don't need to check in other case
  const availableQuestions =
    QUESTION_TYPE_WITH_JUMP.includes(lastQuestionType) || availableQuestionsNotInitialize(oldAvailableQuestions)
      ? getAvailableQuestionsIds(questions, responses)
      : oldAvailableQuestions

  if (!isEqual(oldAvailableQuestions, availableQuestions) || availableQuestionsNotInitialize(oldAvailableQuestions)) {
    memoize.cache.set(getAvailabeQuestionsCacheKey(memoizeId), availableQuestions)
    resetNotAvailableQuestions(questions, responses, availableQuestions, change)
  }

  // display all questions even those not visible for PRINT
  useEffect(() => {
    window.addEventListener('beforeprint', () => setModePrint(true))
    window.addEventListener('afterprint', () => setModePrint(false))
    // unmount
    return () => {
      window.removeEventListener('beforeprint', () => setModePrint(false))
      window.removeEventListener('afterprint', () => setModePrint(false))
    }
  }, [])
  return (
    <div className={divClassName}>
      {fields &&
        fields.map((member, index) => {
          const field = questions[index]
          const isAvailableQuestion = availableQuestions.includes(field.id)
          // don't render all question
          if (shouldNotBeRender(isAvailableQuestion, isModePrint)) return null
          const labelAppend = field.required
            ? strategy === 'minority_required'
              ? ` <span class="warning small"> ${intl.formatMessage({
                  id: 'global.mandatory',
                })}</span>`
              : ''
            : strategy === 'majority_required' || strategy === 'half_required'
            ? ` <span class="excerpt small"> ${intl.formatMessage({
                id: 'global.optional',
              })}</span>`
            : ''
          const labelMessage = field.title + labelAppend
          const label = isQuestionnaire(typeForm) ? (
            <QuestionRender>
              <span
                dangerouslySetInnerHTML={{
                  __html: labelMessage,
                }}
              />
            </QuestionRender>
          ) : (
            <>
              {field.number && <span className="visible-print-block">{field.number}.</span>}{' '}
              <span
                dangerouslySetInnerHTML={{
                  __html: labelMessage,
                }}
              />
            </>
          )

          if (field?.hidden) {
            return null
          }

          switch (field.type) {
            case 'section': {
              return (
                <Section key={field.id} typeForm={typeForm} description={field.description} level={field.level}>
                  {field.title}
                </Section>
              )
            }

            case 'medias': {
              return (
                <BoxWithMarge isQuestionnaire={isQuestionnaire(typeForm)} key={field.id}>
                  <PrivateBox show={field.private}>
                    <Field
                      name={`${member}.value`}
                      id={`${cleanDomId(`${form}-${member}`)}`}
                      type="medias"
                      component={component}
                      help={field.helpText}
                      description={field.description}
                      label={label}
                      disabled={disabled}
                      typeForm={typeForm}
                      onChange={() => setLastQuestionType(field.type)}
                    />
                    <ConditionalJumps jumps={field.jumps} />
                  </PrivateBox>
                </BoxWithMarge>
              )
            }

            case 'select': {
              if (!('choices' in field)) return null

              const loadOptions = (term: string) =>
                new Promise(async resolve => {
                  const response = await fetchQuery_DEPRECATED(environment, MULTIPLE_QUESTION_CHOICES_SEARCH_QUERY, {
                    questionId: field.id,
                    term,
                  })
                  // @ts-ignore
                  resolve(mapQuestionChoicesToOptions(response.node))
                })

              const needsSearch =
                field.choices && field.choices.totalCount > MULTIPLE_QUESTION_CHOICES_COUNT_TRIGGER_SEARCH
              const fieldProps = needsSearch
                ? {
                    debounce: true,
                    loadOptions,
                    cacheOptions: true,
                    autoload: mapQuestionChoicesToOptions(field),
                  }
                : {
                    cacheOptions: true,
                    options: mapQuestionChoicesToOptions(field),
                  }
              return (
                <BoxWithMarge isQuestionnaire={isQuestionnaire(typeForm)} key={field.id}>
                  <PrivateBox show={field.private}>
                    <Field
                      divClassName="reduced"
                      name={`${member}.value`}
                      id={`${cleanDomId(`${form}-${member}`)}`}
                      type={field.type}
                      component={select}
                      help={field.helpText}
                      isOtherAllowed={field.isOtherAllowed}
                      description={field.description}
                      label={label}
                      disabled={disabled}
                      typeForm={typeForm}
                      {...fieldProps}
                      onChange={() => setLastQuestionType(field.type)}
                      selectFieldIsObject
                      selectInputProps={{
                        readOnly: true,
                      }}
                    />
                    <div className="visible-print-block form-fields">
                      {field.choices &&
                        field.choices.edges &&
                        field.choices.edges
                          .filter(Boolean)
                          .map(edge => edge.node)
                          .filter(Boolean)
                          .map(choice => (
                            <div key={choice.id} className="radio">
                              {choice.title}
                            </div>
                          ))}
                    </div>
                    <ConditionalJumps jumps={field.jumps} />
                  </PrivateBox>
                </BoxWithMarge>
              )
            }

            case 'rna':
            case 'siret': {
              const response = responses && responses[index] && responses[index].value ? responses[index].value : null
              return (
                <BoxWithMarge isQuestionnaire={isQuestionnaire(typeForm)} key={field.id}>
                  <PrivateBox show={field.private}>
                    <Field
                      divClassName="reduced"
                      name={`${member}.value`}
                      id={`${cleanDomId(`${form}-${member}`)}`}
                      type={field.type}
                      style={{
                        maxWidth: '180px',
                        background: '#c7edf3',
                        padding: '20px 25px 25px 25px',
                        border: '2px solid #1d8293',
                      }}
                      component={component}
                      description={field.description}
                      help={field.helpText}
                      isOtherAllowed={field.isOtherAllowed}
                      label={label}
                      disabled
                      value={response}
                      typeForm={typeForm}
                    />
                  </PrivateBox>
                </BoxWithMarge>
              )
            }

            case 'number': {
              const response = responses && responses[index] && responses[index].value ? responses[index].value : null
              return (
                <BoxWithMarge isQuestionnaire={isQuestionnaire(typeForm)} key={field.id}>
                  <PrivateBox show={field.private}>
                    <Field
                      divClassName="reduced"
                      name={`${member}.value`}
                      id={`${cleanDomId(`${form}-${member}`)}`}
                      type={field.type}
                      component={component}
                      description={field.description}
                      help={field.helpText}
                      isOtherAllowed={field.isOtherAllowed}
                      label={label}
                      disabled={disabled}
                      value={response}
                      step={field.isRangeBetween ? 'any' : '1'}
                      typeForm={typeForm}
                      style={
                        field.isRangeBetween
                          ? {
                              maxWidth: 150,
                            }
                          : null
                      }
                      max={field.rangeMax || null}
                      min={field.rangeMin || null}
                      onChange={() => {
                        setLastQuestionType(field.type)
                      }}
                    />
                  </PrivateBox>
                </BoxWithMarge>
              )
            }

            default: {
              const response = responses && responses[index] && responses[index].value ? responses[index].value : null
              let choices = []

              if (
                field.type === 'ranking' ||
                field.type === 'radio' ||
                field.type === 'checkbox' ||
                field.type === 'button'
              ) {
                choices = formattedChoicesInField(field)
              }

              return (
                <BoxWithMarge isQuestionnaire={isQuestionnaire(typeForm)} key={field.id}>
                  <PrivateBox show={field.private}>
                    <Field
                      divClassName="reduced"
                      name={`${member}.value`}
                      id={`${cleanDomId(`${form}-${member}`)}`}
                      type={unstable__enableCapcoUiDs && field.type === 'editor' ? 'editor-ds' : field.type}
                      component={component}
                      description={field.description}
                      help={field.helpText}
                      isOtherAllowed={field.isOtherAllowed}
                      choices={choices}
                      label={label}
                      disabled={disabled}
                      value={response}
                      typeForm={typeForm}
                      onChange={() => setLastQuestionType(field.type)}
                      groupedResponsesEnabled={field.groupedResponsesEnabled}
                      responseColorsDisabled={field.responseColorsDisabled}
                    />
                  </PrivateBox>
                </BoxWithMarge>
              )
            }
          }
        })}
    </div>
  )
}

export default RenderResponses
