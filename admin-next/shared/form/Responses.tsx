import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { CapInputSize, FormGuideline, FormLabel, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import type { Responses_questions$key } from '@relay/Responses_questions.graphql'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'

/**
 * For now we only use this component on the RegistrationForm, but it
 * should be easy to add to a Questionnaire, or anything involving questions,
 * just by adding other nodes to this fragment
 */
const FRAGMENT = graphql`
  fragment Responses_questions on Node {
    ... on RegistrationForm {
      questions {
        id
        type
        ...responsesHelper_question @relay(mask: false)
      }
    }
  }
`

const ResponseTop: React.FC<{
  name: string
  label: string
  required: boolean
  helpText: string
  description: string
}> = ({ name, label, required, helpText, description }) => {
  const intl = useIntl()
  return (
    <>
      <FormLabel htmlFor={name} label={label} mb={0}>
        {required ? null : (
          <Text fontSize={2} color="gray.500" fontWeight="normal">
            {intl.formatMessage({ id: 'global.optional' })}
          </Text>
        )}
      </FormLabel>
      {helpText ? <FormGuideline>{helpText}</FormGuideline> : null}
      {description ? <WYSIWYGRender value={description} /> : null}
    </>
  )
}

/**
 * Very simple component for now, only handles simple text questions
 * No conditional jumps, no complex multiple choice questions yet as
 * it's a bit overkill in a RegistrationForm.
 *
 * This component will evolve when we decide to rewrite the Questionnaire app
 * to handle the rest
 */
export const Responses: React.FC<{ questions: Responses_questions$key }> = ({ questions: queryFragment }) => {
  const { control } = useFormContext()
  const query = useFragment(FRAGMENT, queryFragment)
  if (!query || !query.questions?.length) return null

  return (
    <>
      {query.questions.map((question, idx) => {
        const { type, title, required, helpText, description } = question
        const name = `responses.${idx}.value`

        switch (type) {
          case 'text':
          case 'textarea':
            return (
              <FormControl name={name} control={control} isRequired={required} mb={2} key={question.id}>
                <ResponseTop
                  name={name}
                  label={title}
                  required={required}
                  helpText={helpText}
                  description={description}
                />
                <FieldInput
                  type={type}
                  control={control}
                  name={name}
                  id={name}
                  variantSize={CapInputSize.Md}
                  aria-required={required}
                />
              </FormControl>
            )
          case 'select':
            return (
              <FormControl name={name} control={control} isRequired={required} mb={2} key={question.id}>
                <ResponseTop
                  name={name}
                  label={title}
                  required={required}
                  helpText={helpText}
                  description={description}
                />
                <FieldInput
                  type={type}
                  control={control}
                  name={name}
                  aria-required={required}
                  //@ts-ignore TODO fix type ds
                  inputId={`responses-select-${idx}`}
                  //@ts-ignore TODO fix type ds
                  variantSize={CapInputSize.Md}
                  options={question.choices?.edges?.map(({ node }) => ({
                    value: node.id,
                    label: node.title,
                  }))}
                />
              </FormControl>
            )
          default:
            return null
        }
      })}
    </>
  )
}

export default Responses
