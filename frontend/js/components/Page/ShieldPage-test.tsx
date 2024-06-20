/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { RelaySuspensFragmentTest } from '~/testUtils'
import type { ShieldPageTestQuery } from '~relay/ShieldPageTestQuery.graphql'
import { ShieldBody } from './ShieldPage'

import useFeatureFlag from '@shared/hooks/useFeatureFlag'

jest.mock('@shared/hooks/useFeatureFlag')

describe('<ShieldPage />', () => {
  let environment
  let TestComponent
  let testComponentTree
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
      <RelaySuspensFragmentTest useCapUIProvider environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )
  })
  it('renders with registration enabled', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(e => e === 'registration')
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders with registration disabled', () => {
    // @ts-ignore jest
    useFeatureFlag.mockReturnValue(false)
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders with registration disabled and classical auth by pass enabled', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(e => e === 'sso_by_pass_auth')
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
