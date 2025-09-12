/* eslint-env jest */
import React from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'
import type { ChartModalTestQuery } from '@relay/ChartModalTestQuery.graphql'
import { ChartModalQuery } from './ChartModal'
import { render } from '@testing-library/react'

jest.mock('@liinkiing/react-hooks', () => ({
  useDisclosure: () => ({ isOpen: true, onOpen: () => {}, onClose: () => {} }),
}))

jest.mock('@shared/hooks/useIsMobile', () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe('<ChartModal />', () => {
  let environment
  let TestComponent

  const defaultMockResolvers = {
    Query: () => ({
      siteParameter: {
        value: 'I am la charte much ethics wow',
      },
    }),
  }
  const query = graphql`
    query ChartModalTestQuery @relay_test_operation {
      siteParameter(keyname: "charter.body") {
        value
      }
    }
  `

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))

    const TestRenderer = props => {
      const data = useLazyLoadQuery<ChartModalTestQuery>(query, {})
      if (!data) return null
      return <ChartModalQuery query={data} {...props} />
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
