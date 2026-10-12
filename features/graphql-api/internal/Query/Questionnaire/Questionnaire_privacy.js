/* eslint-env jest */
import { request, login, replyCookie, participantCookie, admin, user, emptyPage } from '../../../_privacyGraphql'

const questionResponses = /* GraphQL */ `
  query QuestionnairePrivacy($id: ID!) {
    node(id: $id) {
      ... on SimpleQuestion {
        responses(first: 1) {
          totalCount
          edges {
            node {
              ... on ValueResponse {
                value
                formattedValue
              }
            }
          }
        }
      }
    }
  }
`

const pageFields = `totalCount edges { node { id } } pageInfo { startCursor endCursor hasNextPage hasPreviousPage }`
const replies = `query($id: ID!, $after: String, $includeDraft: Boolean = false, $includeUnpublished: Boolean = false) {
  node(id: $id) { ... on Questionnaire {
    replies(first: 1, after: $after, includeDraft: $includeDraft, includeUnpublished: $includeUnpublished) { ${pageFields} }
  } }
}`
const reply = `query($id: ID!) { node(id: $id) { ... on Reply {
  id responses { ... on ValueResponse { value formattedValue } ... on MediaResponse { medias { url } } }
} } }`
const questionnaireId = toGlobalId('Questionnaire', 'questionnaireAnonymous')
const privateReplyId = toGlobalId('Reply', 'replyAnonymous1')
const token = 'fakeToken1'

/** @jest-status compliant
 * @jest-reason Tests the real HTTP API with isolated identities and explicit authorization assertions.
 */
describe('Questionnaire result privacy', () => {
  it.each(['preview', 'internal'])('protects responses and pagination in %s', async schema => {
    for (const headers of [{}, user]) {
      expect(
        (await request(questionResponses, { id: toGlobalId('Question', 1403) }, schema, headers)).node.responses,
      ).toEqual({ totalCount: 0, edges: [] })
      const publicResult = (await request(replies, { id: questionnaireId }, schema, headers)).node.replies
      expect(publicResult.totalCount).toBeGreaterThan(0)
      expect(publicResult.edges).toEqual([])
      expect(publicResult.pageInfo).toEqual(emptyPage)
      // Even a real cursor and privileged count flags cannot expose the next private page.
      const managerPage = (await request(replies, { id: questionnaireId }, schema, admin)).node.replies
      expect(managerPage.edges).toHaveLength(1)
      expect(
        (
          await request(
            replies,
            {
              id: questionnaireId,
              after: managerPage.pageInfo.endCursor,
              includeDraft: true,
              includeUnpublished: true,
            },
            schema,
            headers,
          )
        ).node.replies,
      ).toEqual(publicResult)
      expect((await request(reply, { id: privateReplyId }, schema, headers)).node).toBeNull()
    }
  })

  it.each(['public', 'preview', 'internal'])('denies direct IDs and nodes without a PHP error in %s', async schema => {
    const publicUserId = toGlobalId('User', 'user5')
    const ids = [
      privateReplyId,
      toGlobalId('ValueResponse', 'responseAnonymousQuestionnaire1'),
      'replyAnonymous1',
      'responseAnonymousQuestionnaire1',
      publicUserId,
    ]
    expect(
      await request(
        `query($id: ID!, $ids: [ID!]!) { node(id: $id) { id } nodes(ids: $ids) { id } }`,
        {
          id: privateReplyId,
          ids,
        },
        schema,
      ),
    ).toEqual({ node: null, nodes: [null, null, null, null, { id: publicUserId }] })
    const publicProfile = await request(
      `query($id: ID!) { node(id: $id) { id } }`,
      { id: toGlobalId('User', 'user5') },
      schema,
    )
    expect(publicProfile.node.id).toBe(toGlobalId('User', 'user5'))
  })

  it('does not accept an HTTP header as a trusted ACL bypass', async () => {
    for (const schema of ['preview', 'internal']) {
      expect(
        (await request(reply, { id: privateReplyId }, schema, { disable_acl: 'true', 'X-Disable-Acl': 'true' })).node,
      ).toBeNull()
    }
  })

  it('accepts only a validated cookie for the exact reply, including drafts', async () => {
    const allowed = await request(reply, { id: privateReplyId }, 'internal', replyCookie(privateReplyId, token))
    expect(allowed.node.responses).toContainEqual({ value: 'bien', formattedValue: 'bien' })
    for (const headers of [
      {},
      { Cookie: 'CapcoAnonReply=invalid' },
      replyCookie(privateReplyId, 'invalid'),
      replyCookie(privateReplyId, Buffer.from('fakeToken2').toString('base64')),
      replyCookie(toGlobalId('Reply', 'replyAnonymous1bis'), token),
      replyCookie(privateReplyId, token, 'questionnaire1'),
    ]) {
      expect((await request(reply, { id: privateReplyId }, 'internal', headers)).node).toBeNull()
    }
    const draft = toGlobalId('Reply', 'replyAnonymousDraft')
    expect((await request(reply, { id: draft }, 'internal', replyCookie(draft, token))).node.responses).toContainEqual({
      value: 'who am i',
      formattedValue: 'who am i',
    })
    const responseId = toGlobalId('ValueResponse', 'responseAnonymousQuestionnaire1')
    const value = await request(
      `query($id: ID!) { node(id: $id) { ... on ValueResponse { value formattedValue } } }`,
      { id: responseId },
      'internal',
      replyCookie(privateReplyId, token),
    )
    expect(value.node).toEqual({ value: 'bien', formattedValue: 'bien' })
  })

  it('keeps own replies and manager access while refusing other organizations', async () => {
    const own = await request(reply, { id: toGlobalId('Reply', 'reply8') }, 'internal', user)
    expect(own.node.responses).toContainEqual({ value: 'secret', formattedValue: 'secret' })
    const otherOrganization = await login('mickael@cap-collectif.com')
    const organizationManager = await login('valerie.massondelmotte@cap-collectif.com')
    const projectManager = await login('theo@cap-collectif.com')
    const orgReply = toGlobalId('Reply', 'replyQuestionnaireOrga')
    expect((await request(reply, { id: orgReply }, 'internal', otherOrganization)).node).toBeNull()
    expect((await request(reply, { id: orgReply }, 'internal', organizationManager)).node.id).toBe(orgReply)
    const managedReply = toGlobalId('Reply', 'replyQuestionnaireAnonPOwner')
    expect((await request(reply, { id: managedReply }, 'internal', projectManager)).node.id).toBe(managedReply)
    expect((await request(reply, { id: privateReplyId }, 'internal', projectManager)).node).toBeNull()
  })

  it('keeps result access restricted while allowing profile-visible metadata in user lists', async () => {
    const query = `query($reply: ID!, $owner: ID!, $project: ID!, $token: String!) {
      participant(token: $token) { id }
      direct: node(id: $reply) { id }
      owner: node(id: $owner) {
        ... on User { userReplies: replies(first: 100) { edges { node { id } } } }
        ... on Participant { participantReplies: replies(first: 100) { edges { node { id } } } }
      }
      project: node(id: $project) { ... on Project {
        contributions(first: 100, type: REPLY) { edges { node { id } } }
      } }
    }`
    const author = await login('lbrunet@cap-collectif.com')
    const projectManager = await login('theo@cap-collectif.com')
    const organizationManager = await login('valerie.massondelmotte@cap-collectif.com')
    const otherOrganization = await login('mickael@cap-collectif.com')
    const cases = [
      ['replyQuestionnaireAnonPOwner', 'User', 'user1', 'projectWithOwner', {}, false],
      ['replyQuestionnaireAnonPOwner', 'User', 'user1', 'projectWithOwner', user, false],
      ['replyQuestionnaireAnonPOwner', 'User', 'user1', 'projectWithOwner', author, true],
      ['replyQuestionnaireAnonPOwner', 'User', 'user1', 'projectWithOwner', admin, true],
      ['replyQuestionnaireAnonPOwner', 'User', 'user1', 'projectWithOwner', projectManager, true],
      ['replyQuestionnaireOrga', 'Participant', 'participant1', 'rapportEvaluation', organizationManager, true],
      ['replyQuestionnaireOrga', 'Participant', 'participant1', 'rapportEvaluation', otherOrganization, false],
      [
        'replyAnonymous1',
        'Participant',
        'participant1',
        'projectWithAnonymousQuestionnaire',
        replyCookie(privateReplyId, token),
        true,
      ],
      [
        'replyAnonymous1bis',
        'Participant',
        'participant1',
        'projectWithAnonymousQuestionnaire',
        replyCookie(privateReplyId, token),
        false,
      ],
      [
        'replyAnonymous1',
        'Participant',
        'participant1',
        'projectWithAnonymousQuestionnaire',
        participantCookie(token),
        true,
        token,
      ],
      ['replyAnonymous2', 'Participant', 'participant2', 'projectWithAnonymousQuestionnaire', {}, false, token],
    ]
    for (const [replyId, ownerType, ownerId, projectId, headers, allowed, participantToken = 'invalid'] of cases) {
      const id = toGlobalId('Reply', replyId)
      const data = await request(
        query,
        {
          reply: id,
          owner: toGlobalId(ownerType, ownerId),
          project: toGlobalId('Project', projectId),
          token: participantToken,
        },
        'internal',
        headers,
      )
      expect({
        replyId,
        direct: data.direct?.id === id,
        sql: (data.owner.userReplies ?? data.owner.participantReplies).edges.some(({ node }) => node.id === id),
        elasticsearch: data.project?.contributions.edges.some(({ node }) => node.id === id) ?? false,
      }).toEqual({
        replyId,
        direct: allowed,
        sql: allowed || replyId === 'replyQuestionnaireAnonPOwner',
        elasticsearch: allowed,
      })
    }
  })

  it('protects cached clouds, choices, other responses, rankings and per-question counts', async () => {
    const query = `query($id: ID!) { node(id: $id) { ... on Questionnaire { questions {
      id responses(first: 1, term: "bien") { totalCount edges { node { ... on ValueResponse { value } } } }
      participants { totalCount }
      ... on SimpleQuestion { tagCloud { value occurrencesCount } }
      ... on MultipleChoiceQuestion {
        tagCloud { value occurrencesCount } otherResponses { totalCount edges { node { ... on ValueResponse { value } } } }
        choices { edges { node { responses { totalCount edges { node { ... on ValueResponse { value } } } }
          ranking { position responses { totalCount } }
        } } }
      }
      ... on MajorityQuestion { responsesByChoice { count } totalVotesCount }
    } } } }`
    for (const id of ['questionnaireAnonymous', 'questionnaire1', 'questionnaire4', 'questionnaireExport']) {
      const variables = { id: toGlobalId('Questionnaire', id) }
      await request(query, variables, 'internal', admin)
      const data = await request(query, variables)
      expect(data.node.questions.length).toBeGreaterThan(0)
      for (const question of data.node.questions) {
        expect(question.responses).toEqual({ totalCount: 0, edges: [] })
        expect(question.participants.totalCount).toBe(0)
        if (question.tagCloud) expect(question.tagCloud).toEqual([])
        if (question.otherResponses) expect(question.otherResponses).toEqual({ totalCount: 0, edges: [] })
        for (const { node } of question.choices?.edges ?? []) {
          expect(node.responses).toEqual({ totalCount: 0, edges: [] })
          expect(node.ranking).toEqual([])
        }
        if (question.responsesByChoice) {
          expect(question.responsesByChoice).toEqual([])
          expect(question.totalVotesCount).toBe(0)
        }
      }
    }
  })

  it('requires a validated participant token for its reply collection', async () => {
    const query = `query($token: String!) { participant(token: $token) { replies(first: 1) { ${pageFields} } } }`
    expect((await request(query, { token: 'invalid' })).participant).toBeNull()
    expect((await request(query, { token })).participant.replies.edges).toEqual([])
    const result = await request(query, { token }, 'internal', participantCookie(token))
    expect(result.participant.replies.edges).toHaveLength(1)
    const withoutToken = await request(
      `query($id: ID!) { node(id: $id) { ... on Participant { replies { ${pageFields} } } } }`,
      { id: toGlobalId('Participant', 'participant1') },
    )
    expect(withoutToken.node.replies).toEqual({ totalCount: 0, edges: [], pageInfo: emptyPage })
  })

  it('hides reply identities in user collections and public participation checks', async () => {
    const query = `query($id: ID!) { node(id: $id) { ... on User {
      replies(first: 1) { ${pageFields} }
      contributions(first: 1, type: REPLY) { ${pageFields} }
    } } }`
    const data = await request(query, { id: toGlobalId('User', 'user5') })
    expect(data.node.replies).toEqual({ totalCount: 0, edges: [], pageInfo: emptyPage })
    expect(data.node.contributions).toEqual({ totalCount: 0, edges: [], pageInfo: emptyPage })
    const check = `query($id: ID!) { node(id: $id) { ... on Questionnaire { userHasReply(login: "user@test.com") } } }`
    expect((await request(check, { id: toGlobalId('Questionnaire', 'questionnaire10') })).node.userHasReply).toBe(false)
    expect(
      (await request(check, { id: toGlobalId('Questionnaire', 'questionnaire10') }, 'internal', user)).node
        .userHasReply,
    ).toBe(true)
  })
  it('filters questionnaire contributions and identities before project and step pagination', async () => {
    const id = toGlobalId('Project', 'projectWithAnonymousQuestionnaire')
    const query = `query($id: ID!, $after: String, $term: String) { node(id: $id) { ... on Project {
      contributions(first: 1, after: $after, type: REPLY) { ${pageFields} }
      contributors(first: 1, term: $term) { ${pageFields} }
    } } }`
    const manager = (await request(query, { id }, 'internal', admin)).node
    expect(manager.contributions.edges).toHaveLength(1)
    const visible = (await request(query, { id })).node
    expect(visible.contributions.totalCount).toBe(manager.contributions.totalCount)
    expect(visible.contributions.edges).toEqual([])
    expect(visible.contributions.pageInfo).toEqual(emptyPage)
    expect(visible.contributors.edges).toEqual([])
    expect(visible.contributors.pageInfo).toEqual(emptyPage)
    expect(visible.contributors.totalCount).toBeGreaterThan(0)
    const filtered = (await request(query, { id, after: manager.contributions.pageInfo.endCursor, term: 'JohnDoe' }))
      .node
    expect(filtered).toEqual(visible)
    const step = await request(
      `query($id: ID!) { node(id: $id) { ... on QuestionnaireStep { contributors(first: 1) { ${pageFields} } } } }`,
      { id: toGlobalId('QuestionnaireStep', 'qStepProjectAnonymousQuestionnaire') },
    )
    expect(step.node.contributors.edges).toEqual([])
    expect(step.node.contributors.pageInfo).toEqual(emptyPage)
    expect(step.node.contributors.totalCount).toBeGreaterThan(0)
  })
})
