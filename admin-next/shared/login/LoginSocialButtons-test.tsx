/* eslint-env jest */
import React from 'react'
import { render } from '@testing-library/react'
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
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
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
    const { asFragment } = render(<TestComponent />)
    expect(asFragment).toMatchSnapshot()
  })
  it('renders only SAML button', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(e => e === 'login_saml')
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, emptyMock))
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
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
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
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
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
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
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders all buttons', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(e => e !== 'sso_by_pass_auth')
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, mock))
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders without OR separator', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(e => e === 'sso_by_pass_auth')
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, mock))
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
})
