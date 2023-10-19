import * as React from 'react'
import { useSelector } from 'react-redux'
import { QueryRenderer, graphql } from 'react-relay'
import { useLocation } from 'react-router-dom'
import environment, { graphqlError } from '~/createRelayEnvironment'
import type { State } from '~/types'
import type { DebateStepPageQueryResponse } from '~relay/DebateStepPageQuery.graphql'
import DebateStepPageLogic from './DebateStepPageLogic'
import { DebateStepPageContext } from './DebateStepPage.context'
import useIsMobile from '~/utils/hooks/useIsMobile'
import './main.css'
export type Props = {
  readonly stepId: string
  readonly fromWidget: boolean
  readonly widgetLocation?: string
  // TODO : type react router
  readonly location?: any
}
export const DebateStepPageWithRouter = (props: Props): JSX.Element => {
  const location = useLocation()
  return <DebateStepPage {...props} location={location} />
}
export const DebateStepPage = ({ stepId, fromWidget, widgetLocation, location }: Props): JSX.Element => {
  let routerState = null
  if (!fromWidget && location) routerState = location.state
  const isMobile = useIsMobile()
  const isAuthenticated = useSelector((state: State) => state.user.user !== null)
  const contextValue = React.useMemo(
    () => ({
      widget: {
        isSource: fromWidget,
        location: widgetLocation,
      },
      stepClosed: true,
    }),
    [fromWidget, widgetLocation],
  )
  return (
    <QueryRenderer
      fetchPolicy="store-and-network"
      environment={environment}
      query={graphql`
        query DebateStepPageQuery($stepId: ID!, $isAuthenticated: Boolean!, $isMobile: Boolean!) {
          ...DebateStepPageLogic_query
            @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated, isMobile: $isMobile)
          step: node(id: $stepId) {
            ... on Step {
              timeRange {
                hasEnded
              }
            }
          }
        }
      `}
      variables={{
        stepId: routerState?.stepId || stepId,
        isAuthenticated,
        isMobile,
      }}
      render={({
        error,
        props,
      }: ReactRelayReadyState & {
        props: DebateStepPageQueryResponse | null | undefined
      }) => {
        if (error) {
          console.error(error) // eslint-disable-line no-console

          return graphqlError
        }

        contextValue.stepClosed =
          typeof props?.step?.timeRange?.hasEnded === 'boolean' ? props?.step?.timeRange?.hasEnded : true
        return (
          <DebateStepPageContext.Provider value={contextValue}>
            <DebateStepPageLogic query={props} />
          </DebateStepPageContext.Provider>
        )
      }}
    />
  )
}
export default DebateStepPage
