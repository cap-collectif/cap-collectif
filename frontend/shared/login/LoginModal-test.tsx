/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, RelaySuspensFragmentTest, FormWrapper } from '~/testUtils'
import type { LoginModalTestQuery } from '~relay/LoginModalTestQuery.graphql'
import { LoginModal } from './LoginModal'

describe('<LoginModal />', () => {
  let environment
  let TestComponent
  let testComponentTree
  const defaultMockResolvers = {
    Query: () => ({}),
  }
  const query = graphql`
    query LoginModalTestQuery @relay_test_operation {
      ...LoginModal_query
    }
  `

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))

    const TestRenderer = props => {
      const data = useLazyLoadQuery<LoginModalTestQuery>(query, {})
      if (!data) return null
      return <LoginModal query={data} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest useCapUIProvider environment={environment}>
        <FormWrapper>
          <TestRenderer {...props} />
        </FormWrapper>
      </RelaySuspensFragmentTest>
    )
  })

  it('render correctly', () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent show />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
