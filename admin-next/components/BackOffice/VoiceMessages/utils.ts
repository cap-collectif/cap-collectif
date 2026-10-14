export const CONNECTION_NODES_PER_PAGE = 50

export const EXPORT_URL = '/export-voice-messages'

export type VoiceMessageStatusFilter = 'ALL' | 'COMPLETED' | 'MISSING_REQUIREMENTS'

/** Protected admin route that streams the audio file of a VocalContribution. */
export const getVoiceMessageFileUrl = (vocalId: string, download = false): string =>
  `/admin/voice-messages/${encodeURIComponent(vocalId)}/file${download ? '?download=1' : ''}`
