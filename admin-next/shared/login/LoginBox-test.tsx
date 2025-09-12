/* eslint-env jest */
import { render } from '@testing-library/react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, RelaySuspensFragmentTest, FormWrapper } from 'tests/testUtils'
import type { LoginBoxTestQuery } from '@relay/LoginBoxTestQuery.graphql'
import { LoginBox } from './LoginBox'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

jest.mock('@shared/hooks/useFeatureFlag')

describe('<LoginBox />', () => {
  let environment
  let TestComponent

  const defaultMockResolvers = {
    Query: () => ({
      textTop: {
        value: 'I am top text',
      },
      textBottom: {
        value: 'I am bottom text',
      },
    }),
  }
  const query = graphql`
    query LoginBoxTestQuery @relay_test_operation {
      ...LoginBox_query
    }
  `

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))

    const TestRenderer = props => {
      const data = useLazyLoadQuery<LoginBoxTestQuery>(query, {})
      if (!data) return null
      return <LoginBox query={data} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <FormWrapper>
          <TestRenderer {...props} />
        </FormWrapper>
      </RelaySuspensFragmentTest>
    )
  })
  it('renders', () => {
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders without LoginForm', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(() => true)
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
})
