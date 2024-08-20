/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, RelaySuspensFragmentTest, FormWrapper } from 'tests/testUtils'
import type { LoginSocialButtonsTestQuery } from '@relay/LoginSocialButtonsTestQuery.graphql'
import { LoginSocialButtons } from './LoginSocialButtons'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

jest.mock('@shared/hooks/useFeatureFlag')

describe('<LoginSocialButtons />', () => {
  let environment
  let TestComponent
  let testComponentTree

  const query = graphql`
    query LoginSocialButtonsTestQuery @relay_test_operation {
      ...LoginSocialButtons_query
    }
  `

  const mock = {
    Query: () => ({
      ssoConfigurations: {
        edges: [
          {
            node: {
              enabled: true,
              name: 'Cap Collectif Oauth2 Provider',
              __typename: 'Oauth2SSOConfiguration',
            },
          },
          {
            node: { enabled: true, name: 'Cap Collectif CAS Provider', __typename: 'CASSSOConfiguration' },
          },
          {
            node: { enabled: true, name: 'France Connect', __typename: 'FranceConnectSSOConfiguration' },
          },
        ],
      },
    }),
  }

  const emptyMock = {
    Query: () => ({
      ssoConfigurations: {
        edges: [],
      },
    }),
  }

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = props => {
      const data = useLazyLoadQuery<LoginSocialButtonsTestQuery>(query, {})
      if (!data) return null
      return <LoginSocialButtons query={data} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <FormWrapper>
          <TestRenderer {...props} />
        </FormWrapper>
      </RelaySuspensFragmentTest>
    )
  })
  it('renders nothing', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(() => false)
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, emptyMock))
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders only Facebook button', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Query: () => ({
          ssoConfigurations: {
            edges: [
              {
                node: { enabled: true, name: 'FB', __typename: 'FacebookSSOConfiguration' },
              },
            ],
          },
        }),
      }),
    )
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders only SAML button', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(e => e === 'login_saml')
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, emptyMock))
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders only CAS button', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(e => e === 'login_cas')
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Query: () => ({
          ssoConfigurations: {
            edges: [
              {
                node: { enabled: true, name: 'Cap Collectif CAS Provider', __typename: 'CASSSOConfiguration' },
              },
            ],
          },
        }),
      }),
    )
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders only OpenID button', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Query: () => ({
          ssoConfigurations: {
            edges: [
              {
                node: { enabled: true, name: 'Cap Collectif Oauth2 Provider', __typename: 'Oauth2SSOConfiguration' },
              },
            ],
          },
        }),
      }),
    )
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders only FranceConnect button', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(e => e === 'login_franceconnect')
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Query: () => ({
          ssoConfigurations: {
            edges: [
              {
                node: { enabled: true, name: 'France Connect', __typename: 'FranceConnectSSOConfiguration' },
              },
            ],
          },
        }),
      }),
    )
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders all buttons', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(e => e !== 'sso_by_pass_auth')
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, mock))
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders without OR separator', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(e => e === 'sso_by_pass_auth')
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, mock))
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
