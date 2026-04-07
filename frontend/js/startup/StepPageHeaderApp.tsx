import * as React from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import type { StepPageHeaderAppQuery as StepPageHeaderAppQueryType } from '~relay/StepPageHeaderAppQuery.graphql'
import StepPageHeader from '~/components/Steps/Page/StepPageHeader/StepPageHeader'
import Providers from './Providers'
import { RelayEnvironmentProvider } from 'relay-hooks'
import environment from '~/createRelayEnvironment'

type Props = {
  readonly stepId: string
}

const QUERY = graphql`
  query StepPageHeaderAppQuery($stepId: ID!) {
    step: node(id: $stepId) {
      ... on Step {
        ...StepPageHeader_step
      }
    }
  }
`

export const StepPageHeaderRenderer = ({ stepId }: Props) => {
  const data = useLazyLoadQuery<StepPageHeaderAppQueryType>(QUERY, { stepId })
  if (!data.step) return null
  return <StepPageHeader step={data.step} />
}

export default ({ stepId }: Props) => (
  <Providers resetCSS={false} designSystem>
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback={null}>
        <StepPageHeaderRenderer stepId={stepId} />
      </React.Suspense>
    </RelayEnvironmentProvider>
  </Providers>
)
