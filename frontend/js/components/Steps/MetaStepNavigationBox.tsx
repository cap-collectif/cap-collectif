import * as React from 'react'

import styled from 'styled-components'
import { graphql, QueryRenderer } from 'react-relay'
import { connect } from 'react-redux'
import type { GlobalState, RelayGlobalId } from '../../types'
import colors from '../../utils/colors'
import environment, { graphqlError } from '../../createRelayEnvironment'
import type {
  MetaStepNavigationBoxQueryResponse,
  MetaStepNavigationBoxQueryVariables,
} from '~relay/MetaStepNavigationBoxQuery.graphql'
import MetaStepNavigation from './MetaStepNavigation'
type ReduxProps = {
  readonly hasNewConsultationPage: boolean
}
export type Props = ReduxProps & {
  readonly stepId: RelayGlobalId
  readonly relatedSlug: string
}
export const META_STEP_NAVIGATION_HEIGHT = 100
const MetaStepNavigationBoxInner = styled.div`
  height: ${META_STEP_NAVIGATION_HEIGHT}px;
  max-height: ${META_STEP_NAVIGATION_HEIGHT}px;
  min-height: ${META_STEP_NAVIGATION_HEIGHT}px;
  padding: 30px;
  display: flex;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  justify-content: space-between;
  align-items: center;
  margin: auto;
  max-width: 1180px;
  & h2 {
    color: ${colors.white};
    margin: 0;
  }
  @media (max-width: 1200px) {
    max-width: 980px;
  }
  @media (max-width: 990px) {
    max-width: 750px;
  }
`

const renderMetaStepNavigation =
  ({ hasNewConsultationPage }: { hasNewConsultationPage: boolean }) =>
  ({
    error,
    props,
  }: ReactRelayReadyState & {
    props: MetaStepNavigationBoxQueryResponse | null | undefined
  }) => {
    if (hasNewConsultationPage) return null

    if (error) {
      console.log(error) // eslint-disable-line no-console
      return graphqlError
    }
    if (props) {
      if (props.step) {
        const { step } = props
        return (
          <MetaStepNavigationBoxInner>
            <MetaStepNavigation step={step} />
          </MetaStepNavigationBoxInner>
        )
      }
      return graphqlError
    }
    return null
  }

export const MetaStepNavigationBox = ({ stepId, relatedSlug, hasNewConsultationPage }: Props) => {
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query MetaStepNavigationBoxQuery($stepId: ID!, $relatedSlug: String!) {
          step: node(id: $stepId) {
            ...MetaStepNavigation_step @arguments(relatedSlug: $relatedSlug)
          }
        }
      `}
      variables={
        {
          stepId,
          relatedSlug,
        } as MetaStepNavigationBoxQueryVariables
      }
      render={renderMetaStepNavigation({
        hasNewConsultationPage,
      })}
    />
  )
}

const mapStateToProps = (state: GlobalState) => ({
  hasNewConsultationPage: state.default.features.unstable__new_consultation_page,
})

export default connect(mapStateToProps)(MetaStepNavigationBox)
