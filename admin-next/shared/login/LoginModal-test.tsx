/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, RelaySuspensFragmentTest, FormWrapper } from 'tests/testUtils'
import type { LoginModalTestQuery } from '@relay/LoginModalTestQuery.graphql'
import { LoginModal } from './LoginModal'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

jest.mock('@shared/hooks/useFeatureFlag')

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
      <RelaySuspensFragmentTest environment={environment}>
        <FormWrapper>
          <TestRenderer {...props} />
        </FormWrapper>
      </RelaySuspensFragmentTest>
    )
  })

  it('render correctly', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(() => false)
    testComponentTree = ReactTestRenderer.create(<TestComponent show />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
