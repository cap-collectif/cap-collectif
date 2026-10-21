import '../../_setupDB'
import '../../_setupES'
import { restoreProposalTestState } from '../../_proposalAuthorRestrictions'
import { GraphQLClient } from 'graphql-request'

// Restore this suite's final scenario even when an assertion fails.
afterAll(restoreProposalTestState)

const ReadProposalAccess = /* GraphQL */ `
  query ReadProposalAccess($id: ID!, $participantToken: String) {
    node(id: $id) {
      ... on Proposal {
        id
        title
        body
        draft
        publicationStatus
        access(participantToken: $participantToken) {
          canEdit
          canDelete
        }
      }
    }
  }
`

const DeleteRestrictedProposalMutation = /* GraphQL */ `
  mutation DeleteRestrictedProposalMutation($input: DeleteProposalInput!) {
    deleteProposal(input: $input) {
      proposal {
        id
      }
    }
  }
`

const CreateDraftProposalMutation = /* GraphQL */ `
  mutation CreateDraftProposalMutation($input: CreateProposalInput!) {
    createProposal(input: $input) {
      proposal {
        id
      }
    }
  }
`

const ChangeProposalContentMutation = /* GraphQL */ `
  mutation ChangeProposalContentMutation($input: ChangeProposalContentInput!) {
    changeProposalContent(input: $input) {
      proposal {
        id
        title
        body
        publicationStatus
      }
    }
  }
`

const ChangeMoreProposalContentMutation = /* GraphQL */ `
  mutation ChangeProposalContentMutation($input: ChangeProposalContentInput!) {
    changeProposalContent(input: $input) {
      proposal {
        id
        title
        body
        publicationStatus
        responses {
          question {
            id
          }
          ... on ValueResponse {
            value
          }
          ... on MediaResponse {
            medias {
              id
            }
          }
        }
      }
    }
  }
`

const ChangeProposalContentAsSuperAdminMutation = /* GraphQL */ `
  mutation ChangeProposalContentMutation($input: ChangeProposalContentInput!) {
    changeProposalContent(input: $input) {
      proposal {
        id
        title
        body
        author {
          ... on User {
            _id
          }
        }
        theme {
          id
        }
        district {
          id
        }
        category {
          id
        }
        responses {
          question {
            id
          }
          ... on ValueResponse {
            value
          }
          ... on MediaResponse {
            medias {
              id
            }
          }
        }
        estimation
        likers {
          id
          displayName
        }
      }
    }
  }
`

const ChangeProposalContentDraftMutation = /* GraphQL */ `
  mutation ChangeProposalContentMutation($input: ChangeProposalContentInput!) {
    changeProposalContent(input: $input) {
      proposal {
        id
        title
        body
        draft
        published
        publicationStatus
      }
    }
  }
`

const ChangeProposalContentDraftAccessMutation = /* GraphQL */ `
  mutation ChangeProposalContentMutation($input: ChangeProposalContentInput!, $participantToken: String) {
    changeProposalContent(input: $input) {
      proposal {
        id
        title
        body
        draft
        published
        publicationStatus
        access(participantToken: $participantToken) {
          canEdit
          canDelete
        }
      }
    }
  }
`

const ChangeProposalContentDraftUserNotConfirmedMutation = /* GraphQL */ `
  mutation ChangeProposalContentMutation($input: ChangeProposalContentInput!) {
    changeProposalContent(input: $input) {
      proposal {
        id
        title
        draft
        publicationStatus
      }
    }
  }
`

const ChangeProposalContentRevisionMutation = /* GraphQL */ `
  mutation ChangeProposalContentMutation($input: ChangeProposalContentInput!) {
    changeProposalContent(input: $input) {
      proposal {
        id
        title
        body
        revisions {
          totalCount
          edges {
            node {
              id
              state
            }
          }
        }
      }
    }
  }
`

const id = toGlobalId('User', 'userAdmin')
const id2 = toGlobalId('User', 'user_not_confirmed_with_contributions')

const input = {
  id: 'UHJvcG9zYWw6cHJvcG9zYWwy',
  title: 'Achetez un DOP à la madeleine',
  body: 'Grâce à ça, on aura des cheveux qui sentent la madeleine !!!!!!!',
  responses: [
    {
      question: 'UXVlc3Rpb246MQ==',
      value: 'reponse-1',
    },
    {
      question: 'UXVlc3Rpb246Mw==',
      value: 'reponse-3',
    },
    {
      question: 'UXVlc3Rpb246MTE=',
      medias: ['media1'],
    },
    {
      question: 'UXVlc3Rpb246MTI=',
      medias: [],
    },
  ],
}

const inputEdit = {
  id: 'UHJvcG9zYWw6cHJvcG9zYWwy',
  title: 'Acheter un sauna par personne pour Capco',
  body: 'Avec tout le travail accompli, on mérite bien chacun un (petit) cadeau, donc on a choisi un sauna. JoliCode interdit',
  responses: [
    {
      question: 'UXVlc3Rpb246MQ==',
      value: 'reponse-1',
    },
    {
      question: 'UXVlc3Rpb246Mw==',
      value: 'reponse-3',
    },
    {
      question: 'UXVlc3Rpb246MTE=',
      medias: ['media1'],
    },
    {
      question: 'UXVlc3Rpb246MTI=',
      medias: [],
    },
  ],
}

const inputEditMore = {
  id: 'UHJvcG9zYWw6cHJvcG9zYWwy',
  title: 'New title',
  body: 'New body',
  category: 'pCategory3',
  responses: [
    {
      question: 'UXVlc3Rpb246Mw==',
      value: 'New reponse-3',
    },
    {
      question: 'UXVlc3Rpb246MTE=',
      medias: ['media1', 'media2'],
    },
    {
      question: 'UXVlc3Rpb246MTI=',
      medias: [],
    },
    {
      question: 'UXVlc3Rpb246MQ==',
      value: 'New reponse-1',
    },
  ],
}

const inputSuperAdmin = {
  title: 'NewTitle',
  body: 'NewBody',
  theme: 'theme1',
  author: id,
  district: 'RGlzdHJpY3Q6ZGlzdHJpY3Qy',
  category: 'pCategory2',
  responses: [
    {
      question: 'UXVlc3Rpb246MTE=',
      medias: ['media1'],
    },
    {
      question: 'UXVlc3Rpb246MQ==',
      value: 'reponse-1',
    },
    {
      question: 'UXVlc3Rpb246Mw==',
      value: 'reponse-3',
    },
    {
      question: 'UXVlc3Rpb246MTI=',
      medias: ['media1'],
    },
  ],
  estimation: 1000,
  likers: ['VXNlcjp1c2VyMQ==', 'VXNlcjp1c2VyMg==', 'VXNlcjp1c2VyMw=='],
  id: 'UHJvcG9zYWw6cHJvcG9zYWwy',
}

const inputEditWithoutRes = {
  id: 'UHJvcG9zYWw6cHJvcG9zYWwy',
  responses: [
    {
      question: 'UXVlc3Rpb246MQ==',
      value: 'reponse-1',
    },
    {
      question: 'UXVlc3Rpb246Mw==',
      value: 'reponse-3',
    },
    {
      question: 'UXVlc3Rpb246MTE=',
      medias: [],
    },
    {
      question: 'UXVlc3Rpb246MTI=',
      medias: [],
    },
  ],
}

const inputDraft = {
  title: 'NewTitle',
  body: 'NewBody',
  theme: 'theme1',
  author: id,
  district: 'RGlzdHJpY3Q6ZGlzdHJpY3Qz',
  draft: false,
  category: 'pCategory2',
  address:
    '[{"address_components":[{"long_name":"262","short_name":"262","types":["street_number"]},{"long_name":"Avenue Général Leclerc","short_name":"Avenue Général Leclerc","types":["route"]},{"long_name":"Rennes","short_name":"Rennes","types":["locality","political"]},{"long_name":"Ille-et-Vilaine","short_name":"Ille-et-Vilaine","types":["administrative_area_level_2","political"]},{"long_name":"Bretagne","short_name":"Bretagne","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"35700","short_name":"35700","types":["postal_code"]}],"formatted_address":"262 Avenue Général Leclerc, 35700 Rennes, France","geometry":{"bounds":{"northeast":{"lat":48.1140978,"lng":-1.6404985},"southwest":{"lat":48.1140852,"lng":-1.640499}},"location":{"lat":48.1140852,"lng":-1.6404985},"location_type":"RANGE_INTERPOLATED","viewport":{"northeast":{"lat":48.1154404802915,"lng":-1.639149769708498},"southwest":{"lat":48.1127425197085,"lng":-1.641847730291502}}},"place_id":"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ","types":["street_address"]}]',
  responses: [
    {
      question: 'UXVlc3Rpb246MQ==',
      value: '',
    },
    {
      question: 'UXVlc3Rpb246Mw==',
      value: 'Réponse à la question obligatoire',
    },
    {
      question: 'UXVlc3Rpb246MTE=',
      medias: ['media10'],
    },
    {
      question: 'UXVlc3Rpb246MTI=',
      medias: ['media10'],
    },
  ],
  id: 'UHJvcG9zYWw6cHJvcG9zYWwyMQ==',
}

const inputDraftUserNotConfirmed = {
  title: 'NewTitle',
  body: 'NewBody',
  theme: 'theme1',
  author: id2,
  district: 'RGlzdHJpY3Q6ZGlzdHJpY3Qz',
  draft: false,
  category: 'pCategory2',
  address:
    '[{"address_components":[{"long_name":"262","short_name":"262","types":["street_number"]},{"long_name":"Avenue Général Leclerc","short_name":"Avenue Général Leclerc","types":["route"]},{"long_name":"Rennes","short_name":"Rennes","types":["locality","political"]},{"long_name":"Ille-et-Vilaine","short_name":"Ille-et-Vilaine","types":["administrative_area_level_2","political"]},{"long_name":"Bretagne","short_name":"Bretagne","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"35700","short_name":"35700","types":["postal_code"]}],"formatted_address":"262 Avenue Général Leclerc, 35700 Rennes, France","geometry":{"bounds":{"northeast":{"lat":48.1140978,"lng":-1.6404985},"southwest":{"lat":48.1140852,"lng":-1.640499}},"location":{"lat":48.1140852,"lng":-1.6404985},"location_type":"RANGE_INTERPOLATED","viewport":{"northeast":{"lat":48.1154404802915,"lng":-1.639149769708498},"southwest":{"lat":48.1127425197085,"lng":-1.641847730291502}}},"place_id":"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ","types":["street_address"]}]',
  responses: [
    {
      question: 'UXVlc3Rpb246MQ==',
      value: '',
    },
    {
      question: 'UXVlc3Rpb246Mw==',
      value: 'Réponse à la question obligatoire',
    },
    {
      question: 'UXVlc3Rpb246MTE=',
      medias: ['media10'],
    },
    {
      question: 'UXVlc3Rpb246MTI=',
      medias: ['media10'],
    },
  ],
  id: 'UHJvcG9zYWw6cHJvcG9zYWxEcmFmdFdpdGhOb3RDb25maXJtZWRBdXRob3I=',
}

const inputRevision = {
  address:
    '[{"address_components":[{"long_name":"Vincennes","short_name":"Vincennes","types":["locality","political"]},{"long_name":"Val-de-Marne","short_name":"Val-de-Marne","types":["administrative_area_level_2","political"]},{"long_name":"Île-de-France","short_name":"IDF","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"94300","short_name":"94300","types":["postal_code"]}],"formatted_address":"94300 Vincennes, France","geometry":{"bounds":{"south":48.840891,"west":2.418554,"north":48.85335800000001,"east":2.4579331},"location":{"lat":48.847759,"lng":2.4394969},"location_type":"APPROXIMATE","viewport":{"south":48.840891,"west":2.418554,"north":48.85335800000001,"east":2.4579331}},"place_id":"ChIJTcXqm6Ny5kcRQDeLaMOCCwQ","types":["locality","political"]}]',
  body: "<p>Je ne crois pas qu'il y ai de petit ou de moyen projet.</p>",
  category: 'pCategoryIdf3',
  district: 'RGlzdHJpY3Q6ZGlzdHJpY3RJZGYy',
  draft: false,
  id: 'UHJvcG9zYWw6cHJvcG9zYWxJZGYx',
  media: null,
  responses: [
    {
      question: 'UXVlc3Rpb246MTMyOQ==',
      value: 'département',
    },
    {
      question: 'UXVlc3Rpb246MzkxOA==',
      value: '{"labels":["Renseigner la présentation de mon Grand Projet"],"other":null}',
    },
    {
      question: 'UXVlc3Rpb246MzUw',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MzA0',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTMzMg==',
      value: '31/12/2023',
    },
    {
      question: 'UXVlc3Rpb246MTMzMw==',
      value: '31/12/2030',
    },
    {
      question: 'UXVlc3Rpb246MTMzNA==',
      value: 160001,
    },
    {
      question: 'UXVlc3Rpb246MTMzNQ==',
      value: 30004,
    },
    {
      question: 'UXVlc3Rpb246MzA1',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTMzMA==',
      value: '123456',
    },
    {
      question: 'UXVlc3Rpb246MzkxOQ==',
      value: '{"labels":["Un autre organisme privé"],"other":null}',
    },
    {
      question: 'UXVlc3Rpb246MTMzMQ==',
      value: 'test',
    },
    {
      question: 'UXVlc3Rpb246MzUx',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MzA3',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM2Mg==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM2Mw==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM2NA==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM2NQ==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM2Ng==',
      value: null,
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTIx',
    },
    {
      question: 'UXVlc3Rpb246MTM2Nw==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MzA2',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MzkyMA==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MzkyMQ==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTMzNg==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTMzNw==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTMzOA==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTMzOQ==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM0MA==',
      value: null,
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTIy',
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTIz',
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTI1',
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTI2',
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTI3',
    },
    {
      question: 'UXVlc3Rpb246MzkyMg==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM0Mg==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM0Mw==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM0NA==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM0NQ==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM0Ng==',
      value: null,
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTI4',
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTI5',
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTMw',
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTMx',
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTMy',
    },
    {
      question: 'UXVlc3Rpb246MTM0Nw==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM0OA==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM0OQ==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM1MA==',
      value: null,
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTMz',
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTM1',
    },
    {
      question: 'UXVlc3Rpb246MTM1MQ==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM1Mg==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM1Mw==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM1NA==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM1NQ==',
      value: null,
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTM2',
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTM3',
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTM4',
    },
    {
      question: 'UXVlc3Rpb246MTM1Ng==',
      value: null,
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTM5',
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTQw',
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTQx',
    },
    {
      question: 'UXVlc3Rpb246MTM1Nw==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM1OA==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM1OQ==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM2MA==',
      value: null,
    },
    {
      question: 'UXVlc3Rpb246MTM2MQ==',
      value: null,
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTQy',
    },
    {
      medias: null,
      question: 'UXVlc3Rpb246MTQz',
    },
  ],
  summary: null,
  title: 'Mon grand projet',
}

describe('mutations.changeProposalContentMutation', () => {
  beforeEach(async () => {
    await global.runSQL(
      'UPDATE step SET prevent_proposal_edit = 0, prevent_proposal_delete = 0 WHERE id = "collectstep1"',
    )
    await global.resetFeatureFlags({ districts: true, themes: true, proposal_revisions: true })
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('rejects missing required responses without changing the proposal', async () => {
    const before = await graphql(ReadProposalAccess, { id: inputEditWithoutRes.id }, 'internal_user')
    expect(before.node.id).toBe(inputEditWithoutRes.id)
    await expect(
      graphql(ChangeProposalContentMutation, { input: inputEditWithoutRes }, 'internal_user'),
    ).rejects.toThrowError('proposal.missing_required_responses')
    const after = await graphql(ReadProposalAccess, { id: inputEditWithoutRes.id }, 'internal_user')
    expect(after.node).toEqual(before.node)
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks explicit mutation results and persisted proposal content with final backend restoration.
   */
  it('updates and persists the authenticated author proposal content', async () => {
    const response = await graphql(ChangeProposalContentMutation, { input }, 'internal_user')
    expect(response.changeProposalContent.proposal).toMatchObject({
      id: input.id,
      title: input.title,
      body: input.body,
      publicationStatus: 'PUBLISHED',
    })
    const persisted = await graphql(ReadProposalAccess, { id: input.id }, 'internal_user')
    expect(persisted.node).toMatchObject({ title: input.title, body: input.body, publicationStatus: 'PUBLISHED' })
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks explicit mutation results and persisted proposal content with final backend restoration.
   */
  it('updates the author proposal content and question responses', async () => {
    const response = await graphql(ChangeProposalContentMutation, { input: inputEdit }, 'internal_user')
    expect(response.changeProposalContent.proposal).toMatchObject({ title: inputEdit.title, body: inputEdit.body })

    const more = await graphql(ChangeMoreProposalContentMutation, { input: inputEditMore }, 'internal_user')
    expect(more.changeProposalContent.proposal).toMatchObject({
      title: inputEditMore.title,
      body: inputEditMore.body,
      responses: expect.arrayContaining([
        { question: { id: toGlobalId('Question', '1') }, value: 'New reponse-1' },
        { question: { id: toGlobalId('Question', '3') }, value: 'New reponse-3' },
        { question: { id: toGlobalId('Question', '11') }, medias: [{ id: 'media1' }, { id: 'media2' }] },
      ]),
    })
    const persisted = await graphql(
      ReadProposalAccess,
      { id: response.changeProposalContent.proposal.id },
      'internal_user',
    )
    expect(persisted.node).toMatchObject({ title: inputEditMore.title, body: inputEditMore.body })
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks explicit mutation results and persisted proposal content with final backend restoration.
   */
  it('allows a super administrator to update another author proposal', async () => {
    const response = await graphql(
      ChangeProposalContentAsSuperAdminMutation,
      { input: inputSuperAdmin },
      'internal_super_admin',
    )
    expect(response.changeProposalContent.proposal).toMatchObject({
      title: inputSuperAdmin.title,
      body: inputSuperAdmin.body,
    })

    expect(response.changeProposalContent.proposal).toMatchObject({
      author: { _id: 'userAdmin' },
      category: { id: 'pCategory2' },
      estimation: 1000,
    })
    const persisted = await graphql(
      ReadProposalAccess,
      { id: response.changeProposalContent.proposal.id },
      'internal_super_admin',
    )
    expect(persisted.node).toMatchObject({ title: inputSuperAdmin.title, body: inputSuperAdmin.body })
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks explicit mutation results and persisted proposal content with final backend restoration.
   */
  it('allows an administrator to update and publish a draft proposal', async () => {
    const response = await graphql(ChangeProposalContentDraftMutation, { input: inputDraft }, 'internal_admin')
    expect(response.changeProposalContent.proposal).toMatchObject({ title: inputDraft.title, body: inputDraft.body })

    expect(response.changeProposalContent.proposal).toMatchObject({
      draft: false,
      published: true,
      publicationStatus: 'PUBLISHED',
    })
    const persisted = await graphql(
      ReadProposalAccess,
      { id: response.changeProposalContent.proposal.id },
      'internal_admin',
    )
    expect(persisted.node).toMatchObject({ title: inputDraft.title, body: inputDraft.body })
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks explicit mutation results and persisted proposal content with final backend restoration.
   */
  it('marks pending revisions as revised when the author updates the proposal', async () => {
    const response = await graphql(ChangeProposalContentRevisionMutation, { input: inputRevision }, 'internal_kiroule')
    expect(response.changeProposalContent.proposal).toMatchObject({
      title: inputRevision.title,
      body: inputRevision.body,
    })

    expect(response.changeProposalContent.proposal.revisions.edges.map(({ node }) => node.state)).toEqual([
      'REVISED',
      'REVISED',
      'REVISED',
      'REVISED',
    ])
    const persisted = await graphql(
      ReadProposalAccess,
      { id: response.changeProposalContent.proposal.id },
      'internal_kiroule',
    )
    expect(persisted.node).toMatchObject({ title: inputRevision.title, body: inputRevision.body })
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks real API permissions with explicit assertions and restores backend data and feature flags.
   */
  it('allows saving and publishing a draft, then applies both author restrictions', async () => {
    const createdDraft = await graphql(
      CreateDraftProposalMutation,
      { input: { proposalFormId: 'proposalForm1', draft: true, title: 'Initial draft title' } },
      'internal_user',
    )
    await global.runSQL(
      'UPDATE step SET prevent_proposal_edit = 1, prevent_proposal_delete = 1 WHERE id = "collectstep1"',
    )
    const draftInput = {
      id: createdDraft.createProposal.proposal.id,
      title: 'Updated draft title',
      body: 'Updated draft body',
      draft: true,
    }
    const savedDraft = await graphql(ChangeProposalContentDraftAccessMutation, { input: draftInput }, 'internal_user')
    expect(savedDraft.changeProposalContent.proposal).toMatchObject({
      title: draftInput.title,
      body: draftInput.body,
      draft: true,
      publicationStatus: 'DRAFT',
      access: { canEdit: true, canDelete: true },
    })
    const persistedDraft = await graphql(ReadProposalAccess, { id: draftInput.id }, 'internal_user')
    expect(persistedDraft.node).toMatchObject({ title: 'Updated draft title', body: 'Updated draft body', draft: true })
    const { author, ...publicationInput } = inputDraft
    const publishedDraft = await graphql(
      ChangeProposalContentDraftAccessMutation,
      { input: { ...publicationInput, id: draftInput.id } },
      'internal_user',
    )
    expect(publishedDraft.changeProposalContent.proposal).toMatchObject({
      draft: false,
      publicationStatus: 'PUBLISHED',
      access: { canEdit: false, canDelete: false },
    })
    await expect(
      graphql(ChangeProposalContentDraftAccessMutation, { input: draftInput }, 'internal_user'),
    ).rejects.toThrow("Can't edit proposal")
    await expect(
      graphql(DeleteRestrictedProposalMutation, { input: { proposalId: draftInput.id } }, 'internal_user'),
    ).rejects.toThrow("Can't delete proposal")
    const persistedPublished = await graphql(ReadProposalAccess, { id: draftInput.id }, 'internal_user')
    expect(persistedPublished.node).toMatchObject({
      title: 'NewTitle',
      body: 'NewBody',
      draft: false,
      publicationStatus: 'PUBLISHED',
      access: { canEdit: false, canDelete: false },
    })
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks real API permissions with explicit assertions and restores backend data and feature flags.
   */
  it.each(['participant', 'email'])('applies published proposal restrictions to a valid %s token', async identity => {
    await global.runSQL('UPDATE proposal SET deleted_at = NULL, is_draft = 0 WHERE id = "proposal1"')
    await global.runSQL(
      'UPDATE step SET prevent_proposal_edit = 1, prevent_proposal_delete = 1 WHERE id = "collectstep1"',
    )
    const tokens =
      identity === 'participant' ? { participantToken: btoa('fakeToken1') } : { emailToken: 'fakeEmailToken1' }
    const before = await graphql(ReadProposalAccess, { id: toGlobalId('Proposal', 'proposal1') }, 'internal')
    expect(before.node.id).toBe(toGlobalId('Proposal', 'proposal1'))
    await expect(
      graphql(
        ChangeProposalContentDraftAccessMutation,
        { input: { id: toGlobalId('Proposal', 'proposal1'), title: 'Forbidden edit', ...tokens } },
        'internal',
      ),
    ).rejects.toThrow("Can't edit proposal")
    const after = await graphql(ReadProposalAccess, { id: toGlobalId('Proposal', 'proposal1') }, 'internal')
    expect(after.node).toEqual(before.node)
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks real API permissions with explicit assertions and restores backend data and feature flags.
   */
  it('allows a participant to save and publish a draft before applying restrictions', async () => {
    await global.runSQL(
      'UPDATE step SET prevent_proposal_edit = 1, prevent_proposal_delete = 1 WHERE id = "collectstep1"',
    )
    const client = new GraphQLClient('https://capco.test/graphql/internal', {
      headers: { Cookie: 'CapcoParticipant=' + btoa('fakeToken1') },
    })
    const created = await client.request(CreateDraftProposalMutation, {
      input: {
        proposalFormId: 'proposalForm1',
        draft: true,
        title: 'Participant draft',
        participantToken: btoa('fakeToken1'),
      },
    })
    const id = created.createProposal.proposal.id
    const saved = await client.request(ChangeProposalContentDraftAccessMutation, {
      participantToken: btoa('fakeToken1'),
      input: { id, title: 'Saved participant draft', draft: true, participantToken: btoa('fakeToken1') },
    })
    expect(saved.changeProposalContent.proposal).toMatchObject({
      publicationStatus: 'DRAFT',
      access: { canEdit: true, canDelete: true },
    })
    const persistedDraft = await client.request(ReadProposalAccess, { id, participantToken: btoa('fakeToken1') })
    expect(persistedDraft.node).toMatchObject({ title: 'Saved participant draft', draft: true })
    const { author, ...publicationInput } = inputDraft
    const published = await client.request(ChangeProposalContentDraftAccessMutation, {
      participantToken: btoa('fakeToken1'),
      input: { ...publicationInput, id, participantToken: btoa('fakeToken1') },
    })
    expect(published.changeProposalContent.proposal).toMatchObject({
      publicationStatus: 'PUBLISHED',
      access: { canEdit: false, canDelete: false },
    })
    await expect(
      client.request(ChangeProposalContentDraftAccessMutation, {
        participantToken: btoa('fakeToken1'),
        input: { id, title: 'Forbidden edit', participantToken: btoa('fakeToken1') },
      }),
    ).rejects.toThrow("Can't edit proposal")
    await expect(
      client.request(DeleteRestrictedProposalMutation, {
        input: { proposalId: id, participantToken: btoa('fakeToken1') },
      }),
    ).rejects.toThrow("Can't delete proposal")
    const persistedPublished = await client.request(ReadProposalAccess, { id, participantToken: btoa('fakeToken1') })
    expect(persistedPublished.node).toMatchObject({
      title: 'NewTitle',
      body: 'NewBody',
      draft: false,
      publicationStatus: 'PUBLISHED',
      access: { canEdit: false, canDelete: false },
    })
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks real API permissions with explicit assertions and restores backend data and feature flags.
   */
  it('rejects a restricted author edit without changing the published proposal', async () => {
    await global.runSQL('UPDATE step SET prevent_proposal_edit = 1 WHERE id = "collectstep1"')
    const before = await graphql(ReadProposalAccess, { id: inputEdit.id }, 'internal_user')
    expect(before.node.id).toBe(inputEdit.id)

    await expect(
      graphql(
        ChangeMoreProposalContentMutation,
        {
          input: inputEdit,
        },
        'internal_user',
      ),
    ).rejects.toThrowError("Can't edit proposal")

    const after = await graphql(ReadProposalAccess, { id: inputEdit.id }, 'internal_user')
    expect(after.node).toEqual(before.node)
  })
})
