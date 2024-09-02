/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, RelaySuspensFragmentTest, FormWrapper } from 'tests/testUtils'
import type { RegistrationModalTestQuery } from '@relay/RegistrationModalTestQuery.graphql'
import { RegistrationModal } from './RegistrationModal'
import useFeatureFlag, { useFeatureFlags } from '@shared/hooks/useFeatureFlag'

jest.mock('use-analytics', () => ({
  useAnalytics: () => ({ track: () => {} }),
}))
jest.mock('@shared/hooks/useFeatureFlag')

describe('<RegistrationModal />', () => {
  let environment
  let TestComponent
  let testComponentTree

  const query = graphql`
    query RegistrationModalTestQuery @relay_test_operation {
      ...RegistrationModal_query
    }
  `

  const mock = {
    Query: () => ({
      registrationForm: {
        topTextDisplayed: true,
        topText: 'Jsuis o top',
        bottomText: 'Jsuis o bottom',
        bottomTextDisplayed: true,
      },
    }),
  }

  const simpleMock = {
    Query: () => ({
      registrationForm: {
        topTextDisplayed: false,
        topText: null,
        bottomText: null,
        bottomTextDisplayed: false,
      },
    }),
  }

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = props => {
      const data = useLazyLoadQuery<RegistrationModalTestQuery>(query, {})
      if (!data) return null
      return <RegistrationModal query={data} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <FormWrapper>
          <TestRenderer {...props} />
        </FormWrapper>
      </RelaySuspensFragmentTest>
    )
  })
  it('renders modal with top and bottom text', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(() => false)
    // @ts-ignore jest
    useFeatureFlags.mockImplementation(() => false)

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, mock))
    testComponentTree = ReactTestRenderer.create(<TestComponent show />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders only form', () => {
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, simpleMock))
    testComponentTree = ReactTestRenderer.create(<TestComponent show />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders closed modal', () => {
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, simpleMock))
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
