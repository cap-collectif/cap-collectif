import Fetcher from './fetch'

describe('Fetcher.ssrGraphql', () => {
  const previousSymfonyEnv = process.env.NEXT_PUBLIC_SYMFONY_ENV

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SYMFONY_ENV = 'test'
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ data: { ok: true } }),
    } as Response)
  })

  afterEach(() => {
    jest.resetAllMocks()
    process.env.NEXT_PUBLIC_SYMFONY_ENV = previousSymfonyEnv
  })

  it('does not append tl query parameter to the SSR graphql endpoint', async () => {
    await Fetcher.ssrGraphql(
      { default: { params: { text: 'query FetcherTest { __typename }' } } } as any,
      {},
      'locale=en-GB',
    )

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe('http://capco.test:8080/graphql/internal')
    expect((global.fetch as jest.Mock).mock.calls[0][1]).toMatchObject({
      headers: expect.objectContaining({
        Cookie: 'locale=en-GB',
      }),
    })
  })
})
