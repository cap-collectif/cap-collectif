/* eslint-env jest */

import React from 'react'
import getFeatureFlags from '@utils/feature-flags-resolver'
import getSessionFromSessionCookie from '@utils/session-resolver'
import getViewerJsonFromRedisSession from '@utils/session-decoder'
import { defaultFeatureFlags } from '@shared/hooks/useFeatureFlag'
import { cookies } from 'next/headers'
import { ssrGraphqlWithLocale } from '../../server/ssr-graphql-with-locale'
import TestProjectLayout from './layout'

const mockNotFound = jest.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})

jest.mock('@utils/feature-flags-resolver', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('@utils/session-resolver', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('@utils/session-decoder', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('../../server/ssr-graphql-with-locale', () => ({
  __esModule: true,
  ssrGraphqlWithLocale: jest.fn(),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => mockNotFound()),
}))

describe('test-project layout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(cookies as jest.Mock).mockReturnValue({
      get: jest.fn(() => ({ value: 'php-session-id' })),
    })
    ;(getSessionFromSessionCookie as jest.Mock).mockResolvedValue('redis-session')
    ;(getViewerJsonFromRedisSession as jest.Mock).mockReturnValue({
      isSuperAdmin: true,
    })
  })

  it('returns a standard 404 when the feature flag is disabled', async () => {
    ;(getFeatureFlags as jest.Mock).mockResolvedValue({
      ...defaultFeatureFlags,
      new_project_page: false,
    })

    await expect(
      TestProjectLayout({
        children: <div>Project page</div>,
        params: Promise.resolve({ projectSlug: 'my-project' }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(getSessionFromSessionCookie).not.toHaveBeenCalled()
    expect(ssrGraphqlWithLocale).not.toHaveBeenCalled()
  })

  it('returns a standard 404 when the viewer is not a super admin', async () => {
    ;(getFeatureFlags as jest.Mock).mockResolvedValue({
      ...defaultFeatureFlags,
      new_project_page: true,
    })
    ;(getViewerJsonFromRedisSession as jest.Mock).mockReturnValue({
      isSuperAdmin: false,
    })

    await expect(
      TestProjectLayout({
        children: <div>Project page</div>,
        params: Promise.resolve({ projectSlug: 'my-project' }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(ssrGraphqlWithLocale).not.toHaveBeenCalled()
  })

  it('renders the page when the feature flag is enabled for a super admin', async () => {
    ;(getFeatureFlags as jest.Mock).mockResolvedValue({
      ...defaultFeatureFlags,
      new_project_page: true,
    })
    ;(ssrGraphqlWithLocale as jest.Mock).mockResolvedValue({
      project: { id: 'project-id' },
    })

    const element = await TestProjectLayout({
      children: <div>Project page</div>,
      params: Promise.resolve({ projectSlug: 'my-project' }),
    })

    expect(ssrGraphqlWithLocale).toHaveBeenCalledWith(expect.anything(), {
      projectSlug: 'my-project',
    })
    expect(element).toMatchObject({
      type: 'main',
      props: { id: 'project-page' },
    })
  })
})
