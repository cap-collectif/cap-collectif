/* eslint-env jest */
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'
import type { PrivacyModalTestQuery } from '@relay/PrivacyModalTestQuery.graphql'
import { PrivacyModalQuery } from './PrivacyModal'

jest.mock('@liinkiing/react-hooks', () => ({
  useDisclosure: () => ({ isOpen: true, onOpen: () => {}, onClose: () => {} }),
}))

describe('<PrivacyModal />', () => {
  let environment
  let TestComponent
  let testComponentTree

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
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
