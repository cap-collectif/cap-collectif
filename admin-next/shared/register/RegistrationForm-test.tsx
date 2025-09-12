/* eslint-env jest */
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, RelaySuspensFragmentTest, FormWrapper } from 'tests/testUtils'
import type { RegistrationFormTestQuery } from '@relay/RegistrationFormTestQuery.graphql'
import { RegistrationForm } from './RegistrationForm'
import useFeatureFlag, { useFeatureFlags } from '@shared/hooks/useFeatureFlag'
import { render } from '@testing-library/react'

jest.mock('@shared/hooks/useFeatureFlag')

describe('<RegistrationForm />', () => {
  let environment
  let TestComponent

  const query = graphql`
    query RegistrationFormTestQuery @relay_test_operation {
      ...RegistrationForm_query
    }
  `

  const mock = {
    Query: () => ({
      organizationName: { value: 'Mon site' },
      internalCommunicationFrom: { value: 'Cap collectif' },
      userTypes: [
        {
          value: '1',
          label: 'Association',
        },
        {
          value: '2',
          label: 'Citoyen',
        },
      ],
    }),
  }

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = props => {
      const data = useLazyLoadQuery<RegistrationFormTestQuery>(query, {})
      if (!data) return null
      return <RegistrationForm query={data} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <FormWrapper>
          <TestRenderer {...props} />
        </FormWrapper>
      </RelaySuspensFragmentTest>
    )
  })
  it('renders a form with inputs and a captcha', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(() => false)
    // @ts-ignore jest
    useFeatureFlags.mockImplementation(() => {
      return { captcha: true }
    })
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, mock))
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders a form with user_type enabled', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(() => false)
    // @ts-ignore jest
    useFeatureFlags.mockImplementation(() => {
      return { user_type: true }
    })
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, mock))
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders a form with zipcode enabled', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(() => false)
    // @ts-ignore jest
    useFeatureFlags.mockImplementation(() => {
      return { zipcode_at_register: true }
    })
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, mock))
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
})
