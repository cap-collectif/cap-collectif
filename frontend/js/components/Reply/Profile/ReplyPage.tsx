import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import { connect } from 'react-redux'
import environment, { graphqlError } from '../../../createRelayEnvironment'
import type { ReplyPageQueryResponse, ReplyPageQueryVariables } from '~relay/ReplyPageQuery.graphql'
import Loader from '../../Ui/FeedbacksIndicators/Loader'
import ProfileReplyList from './ProfileReplyList'
import type { State } from '../../../types'
const query = graphql`
  query ReplyPageQuery($userId: ID!) {
    node(id: $userId) {
      ... on User {
        replies {
          ...ProfileReplyList_replies
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
  isProfileEnabled: boolean
}
export const rendering = ({
  error,
  props,
}: ReactRelayReadyState & {
  props: ReplyPageQueryResponse | null | undefined
}) => {
  if (error) {
    return graphqlError
  }

  if (props) {
    if (props.node?.replies != null) {
      // @ts-expect-error incorrect type definition
      const { node, isProfileEnabled } = props
      return (
        // @ts-expect-error
        <ProfileReplyList replies={node.replies} isProfileEnabled={isProfileEnabled} />
      )
    }
  }

  return <Loader />
}

const mapStateToProps = (state: State) => ({
  isAuthenticated: !!state.user.user,
})

export class ReplyPage extends React.Component<Props> {
  render() {
    const { userId } = this.props
    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={query}
          variables={
            {
              userId,
            } as ReplyPageQueryVariables
          }
          render={rendering}
        />
      </div>
    )
  }
}
// @ts-ignore
const container = connect<any, any>(mapStateToProps)(ReplyPage)
export default container
