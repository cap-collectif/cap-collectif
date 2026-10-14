/* eslint-env jest */
import AddVocalContributionMutation from '~/mutations/AddVocalContributionMutation'
import { VocalContributionError, addVocalContribution, uploadVocalFile } from './vocalContributionApi'

jest.mock('~/mutations/AddVocalContributionMutation', () => ({ __esModule: true, default: { commit: jest.fn() } }))

const commit = AddVocalContributionMutation.commit as jest.Mock
const config = { uploadUrl: '/api/voice-messages', csrfToken: 'csrf' }
const audio = new Blob(['audio'], { type: 'audio/webm;codecs=opus' })

const mockFetch = (status: number, body: unknown) => {
  global.fetch = jest.fn().mockResolvedValue({ ok: status < 300, status, json: () => Promise.resolve(body) })
}

describe('uploadVocalFile', () => {
  it('posts the audio with the CSRF token and the participant token', async () => {
    mockFetch(201, { vocalId: 'vocal', participantToken: 'token' })

    await expect(uploadVocalFile(audio, config, 'cookie')).resolves.toEqual({
      vocalId: 'vocal',
      participantToken: 'token',
    })

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe('/api/voice-messages')
    expect(init.headers).toEqual({ 'X-CSRF-Token': 'csrf' })
    expect((init.body as FormData).get('participantToken')).toBe('cookie')
    expect(((init.body as FormData).get('file') as File).name).toBe('vocal.webm')
  })

  it('rejects with the error code of the back end', async () => {
    mockFetch(404, { errorCode: 'VOCAL_CONTRIBUTION_NOT_CONFIGURED' })

    await expect(uploadVocalFile(audio, config, null)).rejects.toMatchObject({
      code: 'VOCAL_CONTRIBUTION_NOT_CONFIGURED',
    })
  })

  it('rejects with an unknown error when the response is not JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 502, json: () => Promise.reject(new Error()) })

    await expect(uploadVocalFile(audio, config, null)).rejects.toMatchObject({ code: 'UNKNOWN' })
  })
})

describe('addVocalContribution', () => {
  it('returns the payload of the mutation', async () => {
    const payload = { contributionId: 'contribution', shouldTriggerParticipationWorkflow: false }
    commit.mockResolvedValue({ addVocalContribution: payload })

    await expect(addVocalContribution('vocal', 'token')).resolves.toBe(payload)
    expect(commit).toHaveBeenCalledWith({ input: { vocalId: 'vocal', participantToken: 'token' } })
  })

  it('maps the known GraphQL errors to error codes', async () => {
    commit.mockRejectedValue({ message: 'No vocal contribution step is configured.' })

    const error = await addVocalContribution('vocal', null).catch(e => e)
    expect(error).toBeInstanceOf(VocalContributionError)
    expect(error.code).toBe('VOCAL_CONTRIBUTION_NOT_CONFIGURED')
  })

  it('maps the other errors to an unknown error', async () => {
    commit.mockRejectedValue(new Error('Network'))

    await expect(addVocalContribution('vocal', null)).rejects.toMatchObject({ code: 'UNKNOWN' })
  })
})
