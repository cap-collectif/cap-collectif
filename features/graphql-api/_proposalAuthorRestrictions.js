import { execFile } from 'child_process'
import { promisify } from 'util'

const run = promisify(execFile)

// Only the proposal mutation suites use this final restoration.
export const restoreProposalTestState = async () => {
  try {
    await graphql('query EndProposalSession { __typename }', {}, 'internal')
  } finally {
    try {
      await run('docker', [
        'exec',
        '-u',
        'capco',
        '-w',
        '/var/www',
        'capco_application_1',
        'bash',
        '-lc',
        process.env.CI_SHARED_TEST_DATA === '1'
          ? 'bash .circleci/profile-mysql-restore.sh'
          : 'mysql -h database -u root symfony < var/db.backup',
      ])
    } finally {
      await run('docker', [
        'exec',
        '-u',
        'capco',
        '-w',
        '/var/www',
        'capco_application_1',
        'php',
        'scripts/qa/elasticsearch-snapshot.php',
        'restore',
        '--confirm',
        ...(process.env.CI_SHARED_TEST_DATA === '1' ? ['--shared'] : []),
      ])
    }
  }
}
