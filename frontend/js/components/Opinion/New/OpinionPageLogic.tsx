import React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { Flex, Heading } from '@cap-collectif/ui'
import type { OpinionPageLogic_query } from '~relay/OpinionPageLogic_query.graphql'

export type Props = {
  query: OpinionPageLogic_query | null | undefined
  isAuthenticated: boolean
}

const OpinionPageLogic = ({ query }: Props) => {
  const opinion = query?.opinion ?? null
  if (!opinion) return null
  return (
    <Flex>
      <Heading>{opinion.title}</Heading>
    </Flex>
  )
}

export default createFragmentContainer(OpinionPageLogic, {
  query: graphql`
    fragment OpinionPageLogic_query on Query @argumentDefinitions(opinionId: { type: "ID!" }) {
      opinion: node(id: $opinionId) {
        ... on Opinion {
          title
        }
      }
    }
  `,
})
