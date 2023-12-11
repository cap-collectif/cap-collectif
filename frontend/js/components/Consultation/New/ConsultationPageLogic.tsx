import React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import type { ConsultationPageLogic_query } from '~relay/ConsultationPageLogic_query.graphql'
import Heading from '~ui/Primitives/Heading'
import Flex from '~ui/Primitives/Layout/Flex'

export type Props = {
  query: ConsultationPageLogic_query | null | undefined
  isAuthenticated: boolean
}

const ConsultationPageLogic = ({ query }: Props) => {
  const consultationStep = query?.consultationStep ?? null
  const consultation = query?.consultationStep?.consultation ?? null
  if (!consultationStep || !consultation) return null
  return (
    <Flex>
      <Heading>{consultation.title}</Heading>
    </Flex>
  )
}

export default createFragmentContainer(ConsultationPageLogic, {
  query: graphql`
    fragment ConsultationPageLogic_query on Query
    @argumentDefinitions(stepId: { type: "ID!" }, consultationSlug: { type: "String!" }) {
      consultationStep: node(id: $stepId) {
        ... on ConsultationStep {
          title
          consultation(slug: $consultationSlug) {
            title
          }
        }
      }
    }
  `,
})
