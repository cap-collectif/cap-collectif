/* eslint-env jest */
import '../../../_setupDB'

const createProposal = /* GraphQL */ `
  mutation CreateProposalMutation($input: CreateProposalInput!) {
    createProposal(input: $input) {
      proposal {
        webPageUrl
        facebookUrl
        twitterUrl
      }
    }
  }
`

const createProposalFromBackOffice = /* GraphQL */ `
  mutation CreateProposalFromBackOfficeMutation($input: CreateProposalFromBackOfficeInput!) {
    createProposalFromBackOffice(input: $input) {
      proposal {
        title
        body
        webPageUrl
        facebookUrl
        twitterUrl
        author {
          username
        }
        publishedAt
      }
    }
  }
`

describe('Internal|create proposal', () => {
  const input = {
    proposalFormId: 'proposalformCafetier',
    title: "Au ptit qu'a fait",
    body: 'Au ptit café !',
    theme: 'theme1',
    address:
      '[{"address_components":[{"long_name":"262","short_name":"262","types":["street_number"]},{"long_name":"Avenue Général Leclerc","short_name":"Avenue Général Leclerc","types":["route"]},{"long_name":"Rennes","short_name":"Rennes","types":["locality","political"]},{"long_name":"Ille-et-Vilaine","short_name":"Ille-et-Vilaine","types":["administrative_area_level_2","political"]},{"long_name":"Bretagne","short_name":"Bretagne","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"35700","short_name":"35700","types":["postal_code"]}],"formatted_address":"262 Avenue Général Leclerc, 35700 Rennes, France","geometry":{"bounds":{"northeast":{"lat":48.1140978,"lng":-1.6404985},"southwest":{"lat":48.1140852,"lng":-1.640499}},"location":{"lat":48.1140852,"lng":-1.6404985},"location_type":"RANGE_INTERPOLATED","viewport":{"northeast":{"lat":48.1154404802915,"lng":-1.639149769708498},"southwest":{"lat":48.1127425197085,"lng":-1.641847730291502}}},"place_id":"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ","types":["street_address"]}]',
  }
  const proposalForm1Input = {
    proposalFormId: 'proposalForm1',
    title: 'Acheter un sauna pour Capco',
    body: 'Avec tout le travail accompli, on mérite bien un cadeau.',
    theme: 'theme1',
    district: 'RGlzdHJpY3Q6ZGlzdHJpY3Qx', // District:district1
    category: 'pCategory1',
    address: input.address,
    responses: [
      { question: 'UXVlc3Rpb246MQ==', value: '' }, // Question:1
      { question: 'UXVlc3Rpb246Mw==', value: 'Réponse à la question obligatoire' }, // Question:3
      { question: 'UXVlc3Rpb246MTE=', medias: ['media10'] }, // Question:11
      { question: 'UXVlc3Rpb246MTI=', medias: ['media10'] }, // Question:12
    ],
  }

  it('create proposal', async () => {
    // expect.assertions(1);
    const response = await graphql(createProposal, { input }, 'internal_user')
    expect(response).toMatchSnapshot()
  })

  it('creates a draft proposal', async () => {
    const response = await graphql(
      `
        mutation CreateDraftProposalMutation($input: CreateProposalInput!) {
          createProposal(input: $input) {
            proposal {
              title
              publicationStatus
              published
              publishedAt
            }
          }
        }
      `,
      { input: { proposalFormId: 'proposalForm1', draft: true, title: 'Acheter un sauna pour Capco' } },
      'internal_user',
    )

    expect(response.createProposal.proposal).toMatchObject({
      title: 'Acheter un sauna pour Capco',
      publicationStatus: 'DRAFT',
      published: false,
      publishedAt: null,
    })
  })

  it('creates a published proposal with its district', async () => {
    await global.enableFeatureFlag('themes')
    await global.enableFeatureFlag('districts')

    const response = await graphql(
      `
        mutation CreatePublishedProposalMutation($input: CreateProposalInput!) {
          createProposal(input: $input) {
            proposal {
              title
              publicationStatus
              published
              district {
                id
                name
              }
            }
          }
        }
      `,
      { input: { ...proposalForm1Input, draft: false } },
      'internal_user',
    )

    expect(response.createProposal.proposal).toMatchObject({
      title: 'Acheter un sauna pour Capco',
      publicationStatus: 'PUBLISHED',
      published: true,
      district: {
        id: 'RGlzdHJpY3Q6ZGlzdHJpY3Qx', // District:district1
        name: 'Beauregard',
      },
    })
  })

  it.each([
    [
      'rejects an address outside the proposal zone',
      {
        address:
          '[{"address_components":[{"long_name":"18","short_name":"18","types":["street_number"]},{"long_name":"Avenue Parmentier","short_name":"Avenue Parmentier","types":["route"]},{"long_name":"Paris","short_name":"Paris","types":["locality","political"]}],"formatted_address":"18 Avenue Parmentier, 75011 Paris, France","geometry":{"location":{"lat":48.8599104,"lng":2.3791948}},"types":["street_address"]}]',
      },
      'global.address_not_in_zone',
    ],
    [
      'requires a value response',
      {
        responses: [
          { question: 'UXVlc3Rpb246MQ==', value: 'Réponse libre' }, // Question:1
          { question: 'UXVlc3Rpb246MTE=', medias: ['media10'] }, // Question:11
        ],
      },
      'proposal.missing_required_responses {"missing":"3"}',
    ],
    [
      'requires a media response',
      {
        responses: [
          { question: 'UXVlc3Rpb246MQ==', value: 'Réponse libre' }, // Question:1
          { question: 'UXVlc3Rpb246Mw==', value: 'Réponse obligatoire' }, // Question:3
          { question: 'UXVlc3Rpb246MTE=', medias: [] }, // Question:11
          { question: 'UXVlc3Rpb246MTI=', medias: [] }, // Question:12
        ],
      },
      'proposal.missing_required_responses {"missing":"11"}',
    ],
    [
      'rejects an empty required value response',
      {
        responses: [
          { question: 'UXVlc3Rpb246MQ==', value: 'Réponse libre' }, // Question:1
          { question: 'UXVlc3Rpb246Mw==', value: '' }, // Question:3
          { question: 'UXVlc3Rpb246MTE=', medias: ['media10'] }, // Question:11
          { question: 'UXVlc3Rpb246MTI=', medias: [] }, // Question:12
        ],
      },
      'proposal.missing_required_responses {"missing":"3"}',
    ],
    ['requires a category when the form requires one', { category: undefined }, 'global.no_category_when_mandatory'],
    ['requires an address when the form requires one', { address: undefined }, 'global.no_address_when_mandatory'],
  ])('%s', async (_label, overrides, expectedError) => {
    await global.enableFeatureFlag('themes')
    await global.enableFeatureFlag('districts')

    await expect(
      graphql(createProposal, { input: { ...proposalForm1Input, ...overrides } }, 'internal_user'),
    ).rejects.toThrowError(expectedError)
  })

  it('create proposal with social networks', async () => {
    const input = {
      proposalFormId: 'proposalformIdfBP3',
      title: "j'ai des liens facebook et twitter à vendre",
      body: "Les RS, c'est trop bien pour la vulga scientifique",
      theme: 'theme1',
      category: 'pCategory2',
      address:
        '[{"address_components":[{"long_name":"262","short_name":"262","types":["street_number"]},{"long_name":"Avenue Général Leclerc","short_name":"Avenue Général Leclerc","types":["route"]},{"long_name":"Rennes","short_name":"Rennes","types":["locality","political"]},{"long_name":"Ille-et-Vilaine","short_name":"Ille-et-Vilaine","types":["administrative_area_level_2","political"]},{"long_name":"Bretagne","short_name":"Bretagne","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"35700","short_name":"35700","types":["postal_code"]}],"formatted_address":"262 Avenue Général Leclerc, 35700 Rennes, France","geometry":{"bounds":{"northeast":{"lat":48.1140978,"lng":-1.6404985},"southwest":{"lat":48.1140852,"lng":-1.640499}},"location":{"lat":48.1140852,"lng":-1.6404985},"location_type":"RANGE_INTERPOLATED","viewport":{"northeast":{"lat":48.1154404802915,"lng":-1.639149769708498},"southwest":{"lat":48.1127425197085,"lng":-1.641847730291502}}},"place_id":"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ","types":["street_address"]}]',
      webPageUrl: 'http://cap-collectif.com',
      facebookUrl: 'https://www.facebook.com/JVCArmy/',
      twitterUrl: 'https://twitter.com/bestof_1825',
      instagramUrl: null,
      youtubeUrl: null,
      linkedInUrl: null,
      responses: [
        {
          question: toGlobalId('Question', '1393'),
          value: 'ERL',
        },
      ],
    }
    // expect.assertions(1);
    const response = await graphql(createProposal, { input }, 'internal_user')

    expect(response).toMatchSnapshot()
  })
  const inputIdf = {
    proposalFormId: 'proposalformIdfBP3',
    title: "j'ai des liens facebook et twitter à vendre",
    body: "Les RS, c'est trop bien pour la vulga scientifique",
    theme: 'theme1',
    category: 'pCategory2',
    address:
      '[{"address_components":[{"long_name":"262","short_name":"262","types":["street_number"]},{"long_name":"Avenue Général Leclerc","short_name":"Avenue Général Leclerc","types":["route"]},{"long_name":"Rennes","short_name":"Rennes","types":["locality","political"]},{"long_name":"Ille-et-Vilaine","short_name":"Ille-et-Vilaine","types":["administrative_area_level_2","political"]},{"long_name":"Bretagne","short_name":"Bretagne","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"35700","short_name":"35700","types":["postal_code"]}],"formatted_address":"262 Avenue Général Leclerc, 35700 Rennes, France","geometry":{"bounds":{"northeast":{"lat":48.1140978,"lng":-1.6404985},"southwest":{"lat":48.1140852,"lng":-1.640499}},"location":{"lat":48.1140852,"lng":-1.6404985},"location_type":"RANGE_INTERPOLATED","viewport":{"northeast":{"lat":48.1154404802915,"lng":-1.639149769708498},"southwest":{"lat":48.1127425197085,"lng":-1.641847730291502}}},"place_id":"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ","types":["street_address"]}]',
    webPageUrl: 'http://cap-collectif.com',
    facebookUrl: 'https://www.facebook.com/JVCArmy/',
    twitterUrl: 'https://twitter.com/bestof_1825',
    instagramUrl: null,
    youtubeUrl: null,
    linkedInUrl: null,
    responses: [
      {
        question: toGlobalId('Question', '1393'),
        value: 'ERL',
      },
    ],
    publishedAt: '2021-09-02 00:00:00',
    author: toGlobalId('User', 'userMaxime'),
  }

  it('create proposal from back office as admin', async () => {
    const response = await graphql(createProposalFromBackOffice, { input: inputIdf }, 'internal_admin')

    expect(response).toMatchSnapshot()
  })

  it('create proposal from back office as ROLE_PROJECT_ADMIN as owner', async () => {
    const response = await graphql(createProposalFromBackOffice, { input: inputIdf }, 'internal_project_admin')

    expect(response).toMatchSnapshot()
  })

  it('create proposal from back office as ROLE_PROJECT_ADMIN but not owner', async () => {
    await expect(graphql(createProposalFromBackOffice, { input: inputIdf }, 'internal_kiroule')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })

  it('create proposal from back office as user', async () => {
    await expect(graphql(createProposalFromBackOffice, { input: inputIdf }, 'internal_saitama')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
})
