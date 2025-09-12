/* eslint-env jest */
import { render } from '@testing-library/react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import type { ShieldPageTestQuery } from '@relay/ShieldPageTestQuery.graphql'
import { ShieldBody } from './ShieldPage'

import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { RelaySuspensFragmentTest } from 'tests/testUtils'

jest.mock('@shared/hooks/useFeatureFlag')

describe('<ShieldPage />', () => {
  let environment
  let TestComponent
  const defaultMockResolvers = {
    Query: () => ({
      oauth2sso: {
        edges: [
          {
            node: {
              enabled: true,
            },
          },
          {
            node: {
              enabled: false,
            },
          },
        ],
      },
    }),
  }
  const query = graphql`
    query ShieldPageTestQuery @relay_test_operation {
      ...LoginBox_query
      oauth2sso: ssoConfigurations(ssoType: OAUTH2) {
        edges {
          node {
            enabled
          }
        }
      }
    }
  `

  beforeEach(() => {
    environment = createMockEnvironment()
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))

    const TestRenderer = props => {
      const data = useLazyLoadQuery<ShieldPageTestQuery>(query, {})
      if (!data) return null
      return <ShieldBody query={data} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )
  })
  it('renders with registration enabled', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(e => e === 'registration')
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders with registration disabled', () => {
    // @ts-ignore jest
    useFeatureFlag.mockReturnValue(false)
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders with registration disabled and classical auth by pass enabled', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(e => e === 'sso_by_pass_auth')
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
})
