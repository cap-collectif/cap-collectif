/* eslint-disable relay/unused-fields */
/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import type { LoginButtonTestQuery } from '~relay/LoginButtonTestQuery.graphql'
import { LoginButton } from './LoginButton'

describe('<LoginButton />', () => {
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
      siteColors: [
        { keyname: 'color.main_menu.bg', value: 'black' },
        { keyname: 'color.main_menu.text', value: 'white' },
      ],
    }),
  }
  const query = graphql`
    query LoginButtonTestQuery @relay_test_operation {
      ...LoginModal_query
      oauth2sso: ssoConfigurations(ssoType: OAUTH2) {
        edges {
          node {
            enabled
          }
        }
      }
      siteColors {
        keyname
        value
      }
    }
  `

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))

    const TestRenderer = props => {
      const data = useLazyLoadQuery<LoginButtonTestQuery>(query, {})
      if (!data) return null
      return <LoginButton {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest useCapUIProvider environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )
  })
  it('renders a button', () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
