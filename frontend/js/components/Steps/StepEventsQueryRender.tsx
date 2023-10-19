import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import environment, { graphqlError } from '~/createRelayEnvironment'
import type {
  StepEventsQueryRenderQueryResponse,
  StepEventsQueryRenderQueryVariables,
} from '~relay/StepEventsQueryRenderQuery.graphql'
import StepEvents from './StepEvents'
export type Props = {
  readonly stepId: string
}

class StepEventsQueryRender extends React.Component<Props> {
  renderEventList = ({
    error,
    props,
  }: ReactRelayReadyState & {
    props: StepEventsQueryRenderQueryResponse | null | undefined
  }) => {
    if (error) {
      return graphqlError
    }

    if (props && props.step) {
      return <StepEvents step={props.step} />
    }

    // We do not display a loader
    return null
  }

  render() {
    const { stepId } = this.props
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query StepEventsQueryRenderQuery($stepId: ID!) {
            step: node(id: $stepId) {
              __typename
              ...StepEvents_step
            }
          }
        `}
        variables={
          {
            stepId,
          } as StepEventsQueryRenderQueryVariables
        }
        render={this.renderEventList}
      />
    )
  }
}

export default StepEventsQueryRender
