/* eslint-env jest */
import '../../../_setupDB'

const OpinionFields = /* GraphQL */ `
  fragment OpinionFields on Opinion {
    id
    title
    body
    position
    pinned
    trashedStatus
    trashedReason
    author {
      username
    }
    section {
      id
    }
    appendices {
      appendixTypeId
      body
    }
    answer {
      title
      body
      author {
        username
      }
    }
  }
`

const OpinionQuery = /* GraphQL */ `
  query ($id: ID!) {
    node(id: $id) {
      ... on Opinion {
        ...OpinionFields
      }
    }
  }
  ${OpinionFields}
`

const AdminOpinionsQuery = /* GraphQL */ `
  query ($search: String) {
    adminOpinions(search: $search, first: 50) {
      totalCount
      edges {
        node {
          title
        }
      }
    }
  }
`

const CreateOpinionAdminMutation = /* GraphQL */ `
  mutation ($input: CreateOpinionAdminInput!) {
    createOpinionAdmin(input: $input) {
      errorCode
      opinion {
        ...OpinionFields
      }
    }
  }
  ${OpinionFields}
`

const UpdateOpinionAdminMutation = /* GraphQL */ `
  mutation ($input: UpdateOpinionAdminInput!) {
    updateOpinionAdmin(input: $input) {
      errorCode
      opinion {
        ...OpinionFields
      }
    }
  }
  ${OpinionFields}
`

const DeleteOpinionAdminMutation = /* GraphQL */ `
  mutation ($input: DeleteOpinionAdminInput!) {
    deleteOpinionAdmin(input: $input) {
      errorCode
      deletedOpinionId
    }
  }
`

// "Article 1" of the "Section 1" opinion type, which has two appendix types ("1" and "2")
const OPINION_ID = toGlobalId('Opinion', 'opinion57')
const ADMIN_ID = toGlobalId('User', 'userAdmin')

const getOpinion = id => graphql(OpinionQuery, { id }, 'internal_admin').then(data => data.node)

const getTitles = data => data.adminOpinions.edges.map(edge => edge.node.title)

/**
 * @jest-status compliant
 * @jest-reason Exercises the internal GraphQL API as a given viewer and re-reads persisted effects through the API.
 */
describe('Internal|manageOpinionAdmin', () => {
  it('lists the opinions of a private project to its author and to super admins only, like Sonata', async () => {
    const search = 'Opinion endless'

    expect(getTitles(await graphql(AdminOpinionsQuery, { search }, 'internal_admin'))).toEqual([search])
    expect(getTitles(await graphql(AdminOpinionsQuery, { search }, 'internal_super_admin'))).toEqual([search])
    expect(getTitles(await graphql(AdminOpinionsQuery, { search }, 'internal_admin_capco'))).toEqual([])
    await expect(graphql(AdminOpinionsQuery, { search }, 'internal_user')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })

  it('creates an opinion in the consultation of its type, with its appendices and official answer', async () => {
    const { createOpinionAdmin } = await graphql(
      CreateOpinionAdminMutation,
      {
        input: {
          opinionTypeId: 'opinionType5',
          title: ' Nouvelle proposition ',
          body: '<p>Contenu</p>',
          author: ADMIN_ID,
          position: 4,
          pinned: true,
          appendices: [{ appendixTypeId: '1', body: '<p>Motifs</p>' }],
          answer: { title: 'Réponse', body: '<p>Réponse officielle</p>', author: ADMIN_ID },
        },
      },
      'internal_admin',
    )

    expect(createOpinionAdmin.errorCode).toBeNull()
    const persisted = await getOpinion(createOpinionAdmin.opinion.id)
    // The appendices are not ordered by the API
    persisted.appendices.sort((first, second) => first.appendixTypeId.localeCompare(second.appendixTypeId))
    expect(persisted).toEqual({
      id: createOpinionAdmin.opinion.id,
      title: 'Nouvelle proposition',
      body: '<p>Contenu</p>',
      position: 4,
      pinned: true,
      trashedStatus: null,
      trashedReason: null,
      author: { username: 'admin' },
      section: { id: 'opinionType5' },
      // One appendix per appendix type of the opinion type
      appendices: [
        { appendixTypeId: '1', body: '<p>Motifs</p>' },
        { appendixTypeId: '2', body: null },
      ],
      answer: { title: 'Réponse', body: '<p>Réponse officielle</p>', author: { username: 'admin' } },
    })
  })

  it('updates an opinion, puts it in the trash and removes its official answer', async () => {
    const { updateOpinionAdmin } = await graphql(
      UpdateOpinionAdminMutation,
      {
        input: {
          id: OPINION_ID,
          title: 'Article 1 modifié',
          body: '<p>Nouveau contenu</p>',
          author: ADMIN_ID,
          position: null,
          pinned: false,
          trashedStatus: 'INVISIBLE',
          trashedReason: 'Hors sujet',
          appendices: [{ appendixTypeId: '2', body: '<p>Impact</p>' }],
          answer: null,
        },
      },
      'internal_admin',
    )

    expect(updateOpinionAdmin.errorCode).toBeNull()
    const persisted = await getOpinion(OPINION_ID)
    expect(persisted).toMatchObject({
      title: 'Article 1 modifié',
      body: '<p>Nouveau contenu</p>',
      position: null,
      trashedStatus: 'INVISIBLE',
      trashedReason: 'Hors sujet',
      author: { username: 'admin' },
      answer: null,
    })
    expect(persisted.appendices.find(appendix => appendix.appendixTypeId === '2')).toEqual({
      appendixTypeId: '2',
      body: '<p>Impact</p>',
    })
  })

  it.each([
    ['a blank title', { title: ' ' }, 'INVALID_DATA'],
    ['an empty content', { body: '<p></p>' }, 'INVALID_DATA'],
    ['an unknown author', { author: toGlobalId('User', 'unknown') }, 'AUTHOR_NOT_FOUND'],
    [
      'an official answer without content',
      { answer: { title: 'Réponse', body: '<p></p>', author: ADMIN_ID } },
      'INVALID_DATA',
    ],
  ])('rejects %s', async (_, override, errorCode) => {
    const { updateOpinionAdmin } = await graphql(
      UpdateOpinionAdminMutation,
      { input: { id: OPINION_ID, title: 'Titre', body: '<p>Contenu</p>', author: ADMIN_ID, ...override } },
      'internal_admin',
    )

    expect(updateOpinionAdmin).toEqual({ errorCode, opinion: null })
  })

  it.each([
    ['an empty answer', { author: ADMIN_ID, body: '<p></p>' }, 'INVALID_DATA'],
    ['an unknown answer author', { author: toGlobalId('User', 'unknown'), body: 'Answer' }, 'AUTHOR_NOT_FOUND'],
  ])('does not persist changes rejected for %s when another mutation flushes', async (_, answer, errorCode) => {
    const before = await getOpinion(OPINION_ID)
    const result = await graphql(
      /* GraphQL */ `
        mutation ($rejected: UpdateOpinionAdminInput!, $accepted: CreateOpinionAdminInput!) {
          rejected: updateOpinionAdmin(input: $rejected) {
            errorCode
          }
          accepted: createOpinionAdmin(input: $accepted) {
            errorCode
            opinion {
              id
            }
          }
        }
      `,
      {
        rejected: {
          id: OPINION_ID,
          title: 'Rejected title',
          body: '<p>Rejected content</p>',
          author: ADMIN_ID,
          pinned: !before.pinned,
          trashedStatus: 'INVISIBLE',
          trashedReason: 'Rejected reason',
          appendices: [{ appendixTypeId: '2', body: '<p>Rejected appendix</p>' }],
          answer,
        },
        accepted: {
          opinionTypeId: 'opinionType5',
          title: 'Accepted opinion',
          body: '<p>Accepted content</p>',
          author: ADMIN_ID,
        },
      },
      'internal_admin',
    )

    expect(result.rejected.errorCode).toBe(errorCode)
    expect(result.accepted.errorCode).toBeNull()
    expect(result.accepted.opinion.id).toBeTruthy()
    expect(await getOpinion(OPINION_ID)).toEqual(before)
  })

  it('rejects an unknown opinion type', async () => {
    const { createOpinionAdmin } = await graphql(
      CreateOpinionAdminMutation,
      { input: { opinionTypeId: 'unknown', title: 'Titre', body: '<p>Contenu</p>', author: ADMIN_ID } },
      'internal_admin',
    )

    expect(createOpinionAdmin).toEqual({ errorCode: 'OPINION_TYPE_NOT_FOUND', opinion: null })
  })

  it('deletes an opinion', async () => {
    const { deleteOpinionAdmin } = await graphql(
      DeleteOpinionAdminMutation,
      { input: { id: OPINION_ID } },
      'internal_admin',
    )

    expect(deleteOpinionAdmin).toEqual({ errorCode: null, deletedOpinionId: OPINION_ID })
    expect(await getOpinion(OPINION_ID)).toBeNull()

    const { deleteOpinionAdmin: secondDeletion } = await graphql(
      DeleteOpinionAdminMutation,
      { input: { id: OPINION_ID } },
      'internal_admin',
    )
    expect(secondDeletion).toEqual({ errorCode: 'NOT_FOUND', deletedOpinionId: null })
  })

  it('denies the mutations to a non administrator', async () => {
    await expect(
      graphql(DeleteOpinionAdminMutation, { input: { id: OPINION_ID } }, 'internal_user'),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
