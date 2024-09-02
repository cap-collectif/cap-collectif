/* eslint-disable relay/unused-fields */
/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import type { RegistrationButtonTestQuery } from '@relay/RegistrationButtonTestQuery.graphql'
import { RegistrationButton } from './RegistrationButton'
import { addsSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

jest.mock('@shared/hooks/useFeatureFlag')
jest.mock('use-analytics', () => ({
  useAnalytics: () => ({ track: () => {} }),
}))

describe('<RegistrationButton />', () => {
  let environment
  let TestComponent
  let testComponentTree
  const defaultMockResolvers = {
    Query: () => ({
      isAuthenticated: false,
      siteColors: [
        { keyname: 'color.main_menu.bg', value: 'black' },
        { keyname: 'color.main_menu.text', value: 'white' },
      ],
    }),
  }
  const query = graphql`
    query RegistrationButtonTestQuery @relay_test_operation {
      ...RegistrationButton_query
    }
  `

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))

    const TestRenderer = props => {
      const data = useLazyLoadQuery<RegistrationButtonTestQuery>(query, {})
      if (!data) return null
      return <RegistrationButton query={data} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )
  })
  it('renders a button', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(flag => flag === 'registration')
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
