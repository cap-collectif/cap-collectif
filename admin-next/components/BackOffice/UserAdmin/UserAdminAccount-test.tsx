import * as React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { graphql, RelayEnvironmentProvider, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { MockProviders } from 'tests/testUtils'
import UpdateUserAccountMutation from '@mutations/UpdateUserAccountMutation'
import UserAdminAccount, { useUserAdminAccountForm } from './UserAdminAccount'
import type { UserAdminAccountTestQuery } from '@relay/UserAdminAccountTestQuery.graphql'

jest.mock('@mutations/UpdateUserAccountMutation', () => ({ commit: jest.fn() }))
jest.mock('@hookform/resolvers/yup', () => jest.requireActual('@hookform/resolvers/yup/dist/yup.js'))
jest.mock('@hookform/resolvers', () => jest.requireActual('@hookform/resolvers/dist/resolvers.js'))

const TestAccount = () => {
  const data = useLazyLoadQuery<UserAdminAccountTestQuery>(
    graphql`
      query UserAdminAccountTestQuery @relay_test_operation {
        featureFlags {
          type
          enabled
        }
        viewer {
          ...UserAdminAccount_user
        }
      }
    `,
    {},
  )
  const methods = useUserAdminAccountForm(data.viewer)
  return <UserAdminAccount user={data.viewer} methods={methods} />
}

const renderAccount = async (authorized: boolean, featureEnabled: boolean) => {
  const environment = createMockEnvironment()
  const commit = UpdateUserAccountMutation.commit as jest.MockedFunction<typeof UpdateUserAccountMutation.commit>
  commit.mockResolvedValue({ updateUserAccount: { user: { id: 'user-id' } } } as any)
  render(
    <MockProviders viewerSession={{ isSuperAdmin: false }}>
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="">
          <TestAccount />
        </React.Suspense>
      </RelayEnvironmentProvider>
    </MockProviders>,
  )
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Query: () => ({
          featureFlags: [
            { type: 'project_admin', enabled: true },
            { type: 'shield_authorization_controls', enabled: featureEnabled },
          ],
        }),
        User: () => ({
          id: 'user-id',
          roles: authorized ? ['ROLE_USER', 'ROLE_SHIELD_AUTHORIZED_USER'] : ['ROLE_USER'],
          isSuperAdmin: false,
          locked: false,
          vip: false,
          enabled: true,
        }),
      }),
    )
  })
  return commit
}

/**
 * @jest-status compliant
 * @jest-reason Exercises role selection and saving from the real account form, preserving unrelated roles.
 */
describe('User account shield authorization', () => {
  it('hides and preserves an existing shield role when the feature is disabled', async () => {
    const commit = await renderAccount(true, false)
    expect(screen.queryByRole('checkbox', { name: 'roles.shield_authorized_user' })).toBeNull()
    fireEvent.click(screen.getByRole('checkbox', { name: 'form.label_vip' }))
    fireEvent.click(screen.getByRole('button', { name: 'global.save' }))
    await waitFor(() =>
      expect(commit).toHaveBeenCalledWith({
        input: {
          userId: 'user-id',
          roles: ['ROLE_USER', 'ROLE_SHIELD_AUTHORIZED_USER'],
          locked: false,
          vip: true,
          enabled: true,
        },
      }),
    )
  })

  it.each([false, true])('can change shield authorization when initially authorized: %s', async authorized => {
    const commit = await renderAccount(authorized, true)
    const checkbox = screen.getByRole('checkbox', { name: 'roles.shield_authorized_user' }) as HTMLInputElement
    const help = screen.getByText('roles.shield_authorized_user_help')
    expect(checkbox.getAttribute('aria-describedby')?.split(' ')).toContain(help.id)
    expect(checkbox.checked).toBe(authorized)
    fireEvent.click(checkbox)
    fireEvent.click(screen.getByRole('button', { name: 'global.save' }))

    await waitFor(() => expect(commit).toHaveBeenCalledTimes(1))
    expect(commit).toHaveBeenCalledWith({
      input: {
        userId: 'user-id',
        roles: authorized ? ['ROLE_USER'] : ['ROLE_USER', 'ROLE_SHIELD_AUTHORIZED_USER'],
        locked: false,
        vip: false,
        enabled: true,
      },
    })
    await waitFor(() =>
      expect((screen.getByRole('button', { name: 'global.save' }) as HTMLButtonElement).disabled).toBe(true),
    )
  })
})
