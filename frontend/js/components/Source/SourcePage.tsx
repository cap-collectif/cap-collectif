import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import { connect } from 'react-redux'
import environment, { graphqlError } from '../../createRelayEnvironment'
import type { SourcePageQueryResponse, SourcePageQueryVariables } from '~relay/SourcePageQuery.graphql'
import Loader from '../Ui/FeedbacksIndicators/Loader'
import ProfileSourceList from './ProfileSourceList'
import type { State } from '../../types'
const query = graphql`
  query SourcePageQuery($userId: ID!, $isAuthenticated: Boolean!) {
    node(id: $userId) {
      ... on User {
        sources {
          ...ProfileSourceList_sources @arguments(isAuthenticated: $isAuthenticated)
        }
      }
    }
  }
`
type ReduxProps = {
  isAuthenticated: boolean
}
export type Props = ReduxProps & {
  userId: string
}
export const rendering = ({
  error,
  props,
}: ReactRelayReadyState & {
  props: SourcePageQueryResponse | null | undefined
}) => {
  if (error) {
    return graphqlError
  }

  if (props) {
    const { node } = props

    if (node?.sources != null) {
      return <ProfileSourceList sources={node.sources} />
    }
  }

  return <Loader />
}

const mapStateToProps = (state: State) => ({
  isAuthenticated: !!state.user.user,
})

class SourcePage extends React.Component<Props> {
  render() {
    const { isAuthenticated, userId } = this.props
    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={query}
          variables={
            {
              userId,
              isAuthenticated,
            } as SourcePageQueryVariables
          }
          render={rendering}
        />
      </div>
    )
  }
}

// @ts-ignore
const container = connect<any, any>(mapStateToProps)(SourcePage)
export default container
