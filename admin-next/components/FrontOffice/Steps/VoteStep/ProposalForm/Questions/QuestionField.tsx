import { FieldInput, FormControl } from '@cap-collectif/form'
import { CapInputSize, FormGuideline, FormLabel, Heading, Text, UPLOADER_SIZE } from '@cap-collectif/ui'
import MajorityQuestion from '@shared/ui/MajorityQuestion/MajorityQuestion'
import { isWYSIWYGContentEmpty } from '@shared/utils/isWYSIWYGContentEmpty'
import { UPLOAD_PATH } from '@utils/config'
import * as React from 'react'
import { Control, Controller } from 'react-hook-form'
import { ValidationRule } from '../ProposalFormModal.type'
import ButtonChoices from './ButtonChoices'
import MultipleChoiceQuestion from './MultipleChoiceQuestion'
import RankingChoices from './RankingChoices'

type QuestionChoice = {
  id: string
  title: string
  description?: string | null
  color?: string | null
  image?: { id: string; url: string } | null
}

type Question = {
  id: string
  title: string
  type: string
  helpText?: string | null
  description?: string | null
  isOtherAllowed?: boolean
  groupedResponsesEnabled?: boolean
  responseColorsDisabled?: boolean
  validationRule?: ValidationRule | null
  isRangeBetween?: boolean
  rangeMin?: number | null
  rangeMax?: number | null
  choices?: {
    edges?: Array<{ node: QuestionChoice | null } | null> | null
  } | null
}

type Props = {
  question: Question
  name: string
  control: Control<any>
}

const QuestionField: React.FC<Props> = ({ question, name, control }) => {
  const { type, title, helpText, description } = question

  const renderQuestionLabel = () => (
    <>
      <FormLabel htmlFor={name} label={title} />
      {helpText && <FormGuideline>{helpText}</FormGuideline>}
      {description && !isWYSIWYGContentEmpty(description) && (
        <Text color="text.tertiary" fontSize="sm" mb={2} dangerouslySetInnerHTML={{ __html: description }} />
      )}
    </>
  )

  switch (type) {
    case 'text':
      return (
        <FormControl key={question.id} name={name} control={control}>
          {renderQuestionLabel()}
          <FieldInput type="text" control={control} name={name} id={name} variantSize={CapInputSize.Md} />
        </FormControl>
      )
    case 'textarea':
      return (
        <FormControl key={question.id} name={name} control={control}>
          {renderQuestionLabel()}
          <FieldInput type="textarea" control={control} name={name} id={name} rows={4} />
        </FormControl>
      )
    case 'editor':
      return (
        <FormControl key={question.id} name={name} control={control}>
          {renderQuestionLabel()}
          <FieldInput type="textarea" control={control} name={name} id={name} rows={6} />
        </FormControl>
      )
    case 'select':
      return (
        <FormControl key={question.id} name={name} control={control}>
          {renderQuestionLabel()}
          <FieldInput
            type="select"
            control={control}
            name={name}
            id={name}
            options={
              question.choices?.edges
                ?.filter((edge): edge is { node: QuestionChoice } => edge?.node != null)
                .map(({ node }) => ({
                  value: node.id,
                  label: node.title,
                })) || []
            }
          />
        </FormControl>
      )
    case 'radio': {
      const choices =
        question.choices?.edges
          ?.filter((edge): edge is { node: QuestionChoice } => edge?.node != null)
          .map(({ node }) => ({
            id: node.id,
            label: node.title,
            description: node.description,
            image: node.image,
          })) || []

      return (
        <FormControl key={question.id} name={name} control={control}>
          {renderQuestionLabel()}
          <MultipleChoiceQuestion
            name={name}
            control={control}
            choices={choices}
            isOtherAllowed={question?.isOtherAllowed ?? false}
          />
        </FormControl>
      )
    }
    case 'button':
      return (
        <FormControl key={question.id} name={name} control={control}>
          {renderQuestionLabel()}
          <ButtonChoices
            name={name}
            control={control}
            choices={
              question.choices?.edges
                ?.filter((edge): edge is { node: QuestionChoice } => edge?.node != null)
                .map(({ node }) => ({
                  id: node.id,
                  label: node.title,
                  color: node.color,
                  image: node.image,
                })) || []
            }
            groupedResponsesEnabled={question.groupedResponsesEnabled}
            responseColorsDisabled={question.responseColorsDisabled}
          />
        </FormControl>
      )
    case 'checkbox': {
      const choices =
        question.choices?.edges
          ?.filter((edge): edge is { node: QuestionChoice } => edge?.node != null)
          .map(({ node }) => ({
            id: node.id,
            label: node.title,
            description: node.description,
            image: node.image,
          })) || []

      return (
        <FormControl key={question.id} name={name} control={control}>
          {renderQuestionLabel()}
          <MultipleChoiceQuestion
            name={name}
            control={control}
            choices={choices}
            isOtherAllowed={question?.isOtherAllowed ?? false}
            isMultiple
            validationRule={question.validationRule}
          />
        </FormControl>
      )
    }
    case 'ranking':
      return (
        <FormControl key={question.id} name={name} control={control}>
          {renderQuestionLabel()}
          <RankingChoices
            name={name}
            control={control}
            choices={
              question.choices?.edges
                ?.filter((edge): edge is { node: QuestionChoice } => edge?.node != null)
                .map(({ node }) => ({
                  id: node.id,
                  label: node.title,
                  image: node.image,
                })) || []
            }
          />
        </FormControl>
      )
    case 'number':
      return (
        <FormControl key={question.id} name={name} control={control}>
          {renderQuestionLabel()}
          <FieldInput
            type="number"
            control={control}
            name={name}
            id={name}
            min={question.isRangeBetween ? question.rangeMin ?? undefined : undefined}
            max={question.isRangeBetween ? question.rangeMax ?? undefined : undefined}
          />
        </FormControl>
      )
    case 'medias':
      return (
        <FormControl key={question.id} name={name} control={control}>
          {renderQuestionLabel()}
          <FieldInput
            isFullWidth
            type="uploader"
            control={control}
            name={name}
            id={name}
            format=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            maxFiles={5}
            maxSize={8000000}
            showThumbnail
            size={UPLOADER_SIZE.LG}
            uploadURI={UPLOAD_PATH}
          />
        </FormControl>
      )
    case 'siret':
      return (
        <FormControl key={question.id} name={name} control={control}>
          {renderQuestionLabel()}
          <FieldInput
            type="text"
            control={control}
            name={name}
            id={name}
            placeholder="12345678901234"
            maxLength={14}
            variantSize={CapInputSize.Md}
          />
        </FormControl>
      )
    case 'rna':
      return (
        <FormControl key={question.id} name={name} control={control}>
          {renderQuestionLabel()}
          <FieldInput
            type="text"
            control={control}
            name={name}
            id={name}
            placeholder="W123456789"
            maxLength={10}
            variantSize={CapInputSize.Md}
          />
        </FormControl>
      )
    case 'majority':
      return (
        <FormControl key={question.id} name={name} control={control}>
          {renderQuestionLabel()}
          <Controller
            name={name as any}
            control={control}
            render={({ field }) => (
              <MajorityQuestion
                selectedValue={typeof field.value === 'string' ? field.value : null}
                onChange={field.onChange}
              />
            )}
          />
        </FormControl>
      )
    case 'section':
      return (
        <Heading key={question.id} as="h3" fontSize="lg" mt={4} mb={2}>
          {title}
        </Heading>
      )
    default:
      return null
  }
}

export default QuestionField
