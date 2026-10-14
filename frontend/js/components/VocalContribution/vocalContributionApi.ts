import AddVocalContributionMutation from '~/mutations/AddVocalContributionMutation'
import type { AddVocalContributionMutation$data } from '~relay/AddVocalContributionMutation.graphql'

/** Rendered by the homepage template: the upload route and its CSRF token. */
export type UploadConfig = {
  uploadUrl: string
  csrfToken: string
}

/** Error codes of the upload route, plus the ones derived from the mutation errors. */
export type VocalContributionErrorCode =
  | 'VOCAL_CONTRIBUTION_DISABLED'
  | 'VOCAL_CONTRIBUTION_NOT_CONFIGURED'
  | 'RATE_LIMIT_REACHED'
  | 'INVALID_VOICE_DURATION'
  | 'INVALID_VOICE_MESSAGE'
  | 'INVALID_PARTICIPANT_TOKEN'
  | 'INVALID_CSRF_TOKEN'
  | 'UNKNOWN'

export class VocalContributionError extends Error {
  code: VocalContributionErrorCode

  // The original response or error, kept for debugging
  details: unknown

  constructor(code: VocalContributionErrorCode, details?: unknown) {
    super(`Vocal contribution failed: ${code}`)
    this.code = code
    this.details = details
  }
}

// The mutation reports its errors as GraphQL error messages, not as error codes
const MUTATION_ERRORS: Record<string, VocalContributionErrorCode> = {
  'No vocal contribution step is configured.': 'VOCAL_CONTRIBUTION_NOT_CONFIGURED',
  'Invalid participant token.': 'INVALID_PARTICIPANT_TOKEN',
}

const EXTENSIONS: Record<string, string> = { webm: 'webm', ogg: 'ogg', mp4: 'm4a' }

const getFilename = (audio: Blob): string => {
  const subtype = audio.type.split(';')[0].split('/')[1] ?? ''
  return `vocal.${EXTENSIONS[subtype] ?? 'webm'}`
}

export type UploadedVocal = { vocalId: string; participantToken: string | null }

/** Uploads the recorded audio; the back end creates the vocal contribution and returns its id. */
export const uploadVocalFile = async (
  audio: Blob,
  { uploadUrl, csrfToken }: UploadConfig,
  participantToken: string | null,
): Promise<UploadedVocal> => {
  const form = new FormData()
  form.append('file', audio, getFilename(audio))
  if (participantToken) form.append('participantToken', participantToken)

  const response = await fetch(uploadUrl, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'X-CSRF-Token': csrfToken },
    body: form,
  })
  const body = await response.json().catch(() => null)
  if (!response.ok || !body?.vocalId) throw new VocalContributionError(body?.errorCode ?? 'UNKNOWN', body)

  return { vocalId: body.vocalId, participantToken: body.participantToken ?? null }
}

export type AddVocalContributionPayload = NonNullable<AddVocalContributionMutation$data['addVocalContribution']>

/** Attaches the uploaded vocal to the viewer or the participant and tells whether requirements are missing. */
export const addVocalContribution = async (
  vocalId: string,
  participantToken: string | null,
): Promise<AddVocalContributionPayload> => {
  try {
    const response = await AddVocalContributionMutation.commit({ input: { vocalId, participantToken } })
    if (!response.addVocalContribution) throw new VocalContributionError('UNKNOWN', response)
    return response.addVocalContribution
  } catch (error) {
    if (error instanceof VocalContributionError) throw error
    const message = (error as { message?: string } | null)?.message ?? ''
    throw new VocalContributionError(MUTATION_ERRORS[message] ?? 'UNKNOWN', error)
  }
}
