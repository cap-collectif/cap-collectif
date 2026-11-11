export type ContributionTrackingAction =
  | 'started'
  | 'step_viewed'
  | 'requirement_validated'
  | 'error'
  | 'abandoned'
  | 'completed'

const steps = new Map<string, string>()
const completed = new Set<string>()
const pendingErrors = new Set<string>()
const attempts = new Map<string, string>()

const attemptStorageKey = (contributionId: string) => `capco:contribution-attempt:${contributionId}`

const saveAttempt = (contributionId: string, attemptId: string) => {
  attempts.set(contributionId, attemptId)
  try {
    window.sessionStorage.setItem(attemptStorageKey(contributionId), attemptId)
  } catch {
    // Storage is optional; tracking must not interrupt participation.
  }
}

export const getContributionTrackingAttempt = (type: string) => attempts.get(type)

export const bindContributionTrackingAttempt = (contributionId: string, attemptId?: string) => {
  if (attemptId) saveAttempt(contributionId, attemptId)
}

const getAttemptId = (type: string, contributionId?: string) => {
  const key = contributionId || type
  const existingAttempt = attempts.get(key)
  if (existingAttempt) return existingAttempt
  let attemptId: string | undefined
  if (contributionId) {
    try {
      attemptId = window.sessionStorage.getItem(attemptStorageKey(contributionId)) || undefined
    } catch {
      // Use a page-local identifier when storage is unavailable.
    }
  }
  attemptId ||= window.crypto?.randomUUID?.()
  if (attemptId) {
    if (contributionId) saveAttempt(contributionId, attemptId)
    else attempts.set(type, attemptId)
  }
  return attemptId
}

const readStep = (key: string) => {
  if (steps.has(key)) return steps.get(key)
  try {
    return window.sessionStorage.getItem(`capco:contribution-step:${key}`) || undefined
  } catch {
    return undefined
  }
}

// Contribution IDs are kept locally for deduplication; they are never dispatched.
export const trackContribution = (
  type: string,
  action: ContributionTrackingAction,
  step: string,
  contributionId?: string,
) => {
  if (typeof window === 'undefined' || (type !== 'Proposal' && type !== 'VocalContribution')) return
  const key = contributionId || type
  if (action === 'started') {
    steps.delete(key)
    completed.delete(key)
    attempts.delete(type)
  }
  if (completed.has(key) || (contributionId && readStep(key) === 'completed')) return
  if (action === 'error') {
    const errorKey = `${key}:${step}`
    if (pendingErrors.has(errorKey)) return
    pendingErrors.add(errorKey)
    Promise.resolve().then(() => pendingErrors.delete(errorKey))
  }
  if (action === 'completed') {
    completed.add(key)
    completed.add(type)
    if (contributionId) {
      try {
        window.sessionStorage.setItem(`capco:contribution-step:${key}`, 'completed')
      } catch {
        // Storage is optional; tracking must not interrupt participation.
      }
    }
  }
  if (action === 'step_viewed') {
    if (steps.get(key) === step) return
    steps.set(key, step)
    if (contributionId) {
      try {
        window.sessionStorage.setItem(`capco:contribution-step:${key}`, step)
      } catch {
        // Storage is optional; tracking must not interrupt participation.
      }
    }
  }
  window.dispatchEvent(
    new CustomEvent('capco:contribution-tracking', {
      detail: {
        type,
        action,
        step: action === 'completed' ? 'participation_confirmed' : step,
        attemptId: getAttemptId(type, contributionId),
      },
    }),
  )
}

export const getContributionTrackingStep = (type: string, contributionId?: string) =>
  readStep(contributionId || type) || 'form'
