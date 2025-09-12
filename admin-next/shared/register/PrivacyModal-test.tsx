/* eslint-env jest */
import React from 'react'
import { render } from '@testing-library/react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'
import type { PrivacyModalTestQuery } from '@relay/PrivacyModalTestQuery.graphql'
import { PrivacyModalQuery } from './PrivacyModal'

jest.mock('@liinkiing/react-hooks', () => ({
  useDisclosure: () => ({ isOpen: true, onOpen: () => {}, onClose: () => {} }),
}))

jest.mock('@shared/hooks/useIsMobile', () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe('<PrivacyModal />', () => {
  let environment
  let TestComponent

  const defaultMockResolvers = {
    Query: () => ({
      siteParameter: {
        value: 'I am privacy such privacy much legal',
      },
    }),
  }
  const query = graphql`
    query PrivacyModalTestQuery @relay_test_operation {
      siteParameter(keyname: "privacy-policy") {
        value
      }
    }
  `

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))

    const TestRenderer = props => {
      const data = useLazyLoadQuery<PrivacyModalTestQuery>(query, {})
      if (!data) return null
      return <PrivacyModalQuery query={data} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )
  })
  it('renders correctly', () => {
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
})
