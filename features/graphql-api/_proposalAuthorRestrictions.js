import { execFile } from 'child_process'
import { promisify } from 'util'

const run = promisify(execFile)

// Only the proposal mutation suites use this final restoration.
const restore = task => {
  const environment = process.env.CI ? 'ci' : 'local'
  return run('castor', [`${environment}:qa:${task}`, '--confirm'])
}

export const restoreProposalTestState = async () => {
  try {
    await graphql('query EndProposalSession { __typename }', {}, 'internal')
  } finally {
    try {
      await restore('restore-db')
    } finally {
      await restore('restore-es-snapshot')
    }
  }
}
