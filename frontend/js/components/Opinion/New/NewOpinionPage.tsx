import React from 'react'
import { connect } from 'react-redux'
import { graphql, QueryRenderer } from 'react-relay'
import environment, { graphqlError } from '~/createRelayEnvironment'
import type { State } from '~/types'
import OpinionPageLogic from '~/components/Opinion/New/OpinionPageLogic'
import type { NewOpinionPageQueryResponse } from '~relay/NewOpinionPageQuery.graphql'
export type Props = {
  readonly opinionId?: string
  readonly versionId?: string
  readonly isAuthenticated: boolean
}
export const NewOpinionPage = ({ opinionId, versionId, isAuthenticated }: Props) => {
  const id = opinionId ?? versionId

  if (!id) {
    return null
  }

  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query NewOpinionPageQuery($opinionId: ID!) {
          ...OpinionPageLogic_query @arguments(opinionId: $opinionId)
        }
      `}
      variables={{
        opinionId: id,
        isAuthenticated,
      }}
      render={({
        error,
        props,
      }: ReactRelayReadyState & {
        props: NewOpinionPageQueryResponse | null | undefined
      }) => {
        if (error) {
          console.log(error) // eslint-disable-line no-console

          return graphqlError
        }

        return <OpinionPageLogic query={props} isAuthenticated={isAuthenticated} />
      }}
    />
  )
}

const mapStateToProps = (state: State) => ({
  isAuthenticated: state.user.user !== null,
})

export default connect(mapStateToProps)(NewOpinionPage)
