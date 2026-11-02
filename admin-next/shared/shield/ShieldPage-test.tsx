/* eslint-env jest */
import { act, render, screen } from '@testing-library/react'
import { graphql, RelayEnvironmentProvider, useLazyLoadQuery } from 'react-relay'
import { IntlProvider } from 'react-intl'
import { CapUIProvider } from '@cap-collectif/ui'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import type { ShieldPageTestQuery } from '@relay/ShieldPageTestQuery.graphql'
import { ShieldBody, ShieldPage } from './ShieldPage'

import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { RelaySuspensFragmentTest } from 'tests/testUtils'

jest.mock('@shared/hooks/useFeatureFlag')

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
describe('<ShieldPage />', () => {
  let environment
  let TestComponent
  const defaultMockResolvers = {
    Query: () => ({
      oauth2sso: {
        edges: [
          {
            node: {
              enabled: true,
            },
          },
          {
            node: {
              enabled: false,
            },
          },
        ],
      },
    }),
  }
  const query = graphql`
    query ShieldPageTestQuery @relay_test_operation {
      ...LoginBox_query
      oauth2sso: ssoConfigurations(ssoType: OAUTH2) {
        edges {
          node {
            enabled
          }
        }
      }
    }
  `

  beforeEach(() => {
    environment = createMockEnvironment()
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))

    const TestRenderer = props => {
      const data = useLazyLoadQuery<ShieldPageTestQuery>(query, {})
      if (!data) return null
      return <ShieldBody query={data} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )
  })
  it('renders with registration enabled', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(e => e === 'registration')
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders with registration disabled', () => {
    // @ts-ignore jest
    useFeatureFlag.mockReturnValue(false)
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders with registration disabled and classical auth by pass enabled', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(e => e === 'sso_by_pass_auth')
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
})

/**
 * @jest-status compliant
 * @jest-reason Checks the visible refusal and logout link without initiating a login GraphQL operation.
 */
it('shows access denial without loading the login query', () => {
  const environment = createMockEnvironment()
  render(
    // @ts-expect-error React Intl v2 types do not declare children with React 18.
    <IntlProvider
      locale="en"
      messages={{
        'front.platform-access.restricted-title': 'Restricted access',
        'front.platform-access.access-denied': 'Contact an administrator to request access.',
        'global.logout': 'Log out',
      }}
    >
      <RelayEnvironmentProvider environment={environment}>
        <CapUIProvider>
          <ShieldPage accessDenied />
        </CapUIProvider>
      </RelayEnvironmentProvider>
    </IntlProvider>,
  )

  expect(screen.getByRole('heading', { name: 'Restricted access' })).toBeDefined()
  expect(screen.getByText('Contact an administrator to request access.')).toBeDefined()
  expect(screen.getByRole('link', { name: 'Log out' }).getAttribute('href')).toBe('/logout')
  expect(environment.mock.getAllOperations()).toEqual([])
})

/**
 * @jest-status compliant
 * @jest-reason Resolves the real component's Relay query and checks the visible login form instead of the refusal.
 */
it('loads and displays the login form when access is not denied', async () => {
  const environment = createMockEnvironment()
  const mockFeatureFlag = useFeatureFlag as jest.MockedFunction<typeof useFeatureFlag>
  const previousImplementation = mockFeatureFlag.getMockImplementation()
  mockFeatureFlag.mockReturnValue(false)

  try {
    render(
      <RelaySuspensFragmentTest environment={environment}>
        <ShieldPage accessDenied={false} />
      </RelaySuspensFragmentTest>,
    )

    expect(environment.mock.getMostRecentOperation().request.node.params.name).toBe('ShieldPageQuery')
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Query: () => ({
            oauth2sso: { edges: [] },
            ssoConfigurations: { edges: [] },
            textTop: { value: null },
            textBottom: { value: null },
          }),
        }),
      )
    })

    expect(screen.getByRole('textbox', { name: /global.email/ })).toBeDefined()
    expect(screen.getByLabelText(/global.password/)).toBeDefined()
    expect(screen.getByRole('button', { name: 'global.login_me' })).toBeDefined()
    expect(screen.queryByRole('link', { name: 'global.logout' })).toBeNull()
  } finally {
    if (previousImplementation) mockFeatureFlag.mockImplementation(previousImplementation)
    else mockFeatureFlag.mockReset()
  }
})
