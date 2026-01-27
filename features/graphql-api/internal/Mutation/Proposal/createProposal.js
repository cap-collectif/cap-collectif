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
  it('create proposal', async () => {
    // expect.assertions(1);
    const response = await graphql(createProposal, { input }, 'internal_user')
    expect(response).toMatchSnapshot()
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
