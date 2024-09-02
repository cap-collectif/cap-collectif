/* eslint-disable relay/unused-fields */
/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import type { LoginButtonTestQuery } from '@relay/LoginButtonTestQuery.graphql'
import { LoginButton } from './LoginButton'
import { addsSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

jest.mock('@shared/hooks/useFeatureFlag')

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
      ...LoginButton_query
    }
  `

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))

    const TestRenderer = props => {
      const data = useLazyLoadQuery<LoginButtonTestQuery>(query, {})
      if (!data) return null
      return <LoginButton query={data} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )
  })
  it('renders a button', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(() => false)
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
