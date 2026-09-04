import { cookies, headers } from 'next/headers'
import nodeFetch from 'node-fetch'
import { ssrGraphqlWithLocale } from './ssr-graphql-with-locale'

jest.mock('node-fetch', () => jest.fn())
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
  headers: jest.fn(),
}))

describe('ssrGraphqlWithLocale', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SYMFONY_ENV = 'test'
    ;(cookies as jest.Mock).mockReturnValue({ get: () => undefined, getAll: () => [] })
    ;(headers as jest.Mock).mockReturnValue({
      get: (name: string) => (name === 'host' ? 'capco.dev' : null),
    })
    ;(nodeFetch as unknown as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { ok: true } }),
    } as Response)
  })

  it('forwards the request host to Symfony', async () => {
    await ssrGraphqlWithLocale({ default: { params: { text: 'query HostTest { __typename }' } } } as any)

    expect(nodeFetch).toHaveBeenCalledWith(
      'http://application:8080/graphql/internal?tl=fr-FR',
      expect.objectContaining({
        headers: expect.objectContaining({ Host: 'capco.dev' }),
      }),
    )
  })
})
