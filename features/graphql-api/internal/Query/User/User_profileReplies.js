/* eslint-env jest */
import { execFile } from 'child_process'
import { promisify } from 'util'
import { request, user, admin } from '../../../_privacyGraphql'

const query = `query($id: ID!, $first: Int = 100, $after: String) {
  node(id: $id) { ... on User { replies(first: $first, after: $after) {
    totalCount
    edges { node { id questionnaire { title } responses { ... on ValueResponse { value formattedValue } ... on MediaResponse { medias { url } } } } }
    pageInfo { endCursor hasNextPage }
  } } }
}`
const read = async (id, headers = {}, pagination = {}) =>
  (await request(query, { id: toGlobalId('User', id), ...pagination }, 'internal', headers)).node.replies
const sql = statement =>
  promisify(execFile)('docker', [
    'exec',
    '-w',
    '/var/www',
    'capco_application_1',
    'php',
    '-d',
    'memory_limit=-1',
    'bin/console',
    'doctrine:query:sql',
    statement,
    '--no-interaction',
    '--env=test',
  ])

/** @jest-status compliant
 * @jest-reason Verifies public profile metadata and answer confidentiality through the real API.
 */
describe('Public profile replies', () => {
  it('lists public participation metadata without granting access to answers', async () => {
    const data = await read('userAdmin')
    expect(data.edges.map(edge => edge.node.id)).toContain(toGlobalId('Reply', 'reply2'))
    expect(data.edges.map(edge => edge.node.id)).not.toContain(toGlobalId('Reply', 'reply9'))
    expect(data.totalCount).toBe(data.edges.length)
    for (const { node } of data.edges) {
      expect(node.questionnaire.title).toBeTruthy()
      expect(node.responses).toEqual([])
    }
    const direct = await request(
      `query($reply: ID!, $response: ID!) {
      reply: node(id: $reply) { id }
      response: node(id: $response) { ... on ValueResponse { value formattedValue } }
    }`,
      { reply: toGlobalId('Reply', 'tagCloudReply15'), response: toGlobalId('ValueResponse', 'responseTagCloud29') },
    )
    expect(direct).toEqual({ reply: null, response: null })
  })

  it('paginates public replies with a stable count and no duplicates', async () => {
    const ids = []
    let after = null
    do {
      const page = await read('user150', {}, { first: 4, after })
      expect(page.totalCount).toBe(15)
      ids.push(...page.edges.map(edge => edge.node.id))
      after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null
    } while (after && ids.length < 20)
    expect(ids.sort()).toEqual(
      Array.from({ length: 15 }, (_, index) => toGlobalId('Reply', `tagCloudReply${index + 1}`)).sort(),
    )
  })

  it.each([
    ['private', 'private', '1', '0'],
    ['draft', 'is_draft', '1', '0'],
    ['unpublished', 'published', '0', '1'],
    ['incomplete', 'completion_status', '"MISSING_REQUIREMENTS"', '"COMPLETED"'],
  ])('excludes %s replies from both the list and count', async (_name, column, hidden, original) => {
    const before = await read('userAdmin')
    try {
      await sql(`UPDATE reply SET ${column} = ${hidden} WHERE id = "reply2"`)
      const after = await read('userAdmin')
      expect(after.totalCount).toBe(before.totalCount - 1)
      expect(after.edges.map(edge => edge.node.id)).toEqual(
        before.edges.map(edge => edge.node.id).filter(id => id !== toGlobalId('Reply', 'reply2')),
      )
    } finally {
      await sql(`UPDATE reply SET ${column} = ${original} WHERE id = "reply2"`)
    }
  })

  it('keeps private replies available to their author and managers', async () => {
    expect((await read('user5')).edges).toEqual([])
    for (const headers of [user, admin]) {
      const own = await read('user5', headers)
      expect(own.edges.map(edge => edge.node.id)).toContain(toGlobalId('Reply', 'replyPrivate'))
      expect(own.edges.map(edge => edge.node.id)).toContain(toGlobalId('Reply', 'replyUnpublishedAndDraft'))
      expect(own.edges.find(edge => edge.node.id === toGlobalId('Reply', 'reply8')).node.responses).toContainEqual({
        value: 'secret',
        formattedValue: 'secret',
      })
    }
  })

  it('keeps incomplete replies available to their author and managers', async () => {
    try {
      await sql('UPDATE reply SET completion_status = "MISSING_REQUIREMENTS" WHERE id = "reply8"')
      for (const headers of [user, admin]) {
        const data = await read('user5', headers)
        expect(data.edges.map(edge => edge.node.id)).toContain(toGlobalId('Reply', 'reply8'))
      }
    } finally {
      await sql('UPDATE reply SET completion_status = "COMPLETED" WHERE id = "reply8"')
    }
  })

  it.each([
    ['disabled step', 'step', 'is_enabled', '0', '1', 'questionnairestep1'],
    ['restricted project', 'project', 'visibility', '1', '2', 'project8'],
  ])('hides participation in a %s', async (_name, table, column, hidden, original, id) => {
    try {
      await sql(`UPDATE ${table} SET ${column} = ${hidden} WHERE id = "${id}"`)
      for (const headers of [{}, user]) {
        const data = await read('user150', headers)
        expect(data.totalCount).toBe(0)
        expect(data.edges).toEqual([])
      }
    } finally {
      await sql(`UPDATE ${table} SET ${column} = ${original} WHERE id = "${id}"`)
    }
  })
})
