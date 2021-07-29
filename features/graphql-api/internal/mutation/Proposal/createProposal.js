/* eslint-env jest */
import '../../../_setup';

const createProposal = /* GraphQL */ `
  mutation CreateProposalMutation($input: CreateProposalInput!) {
    createProposal(input: $input) {
      proposal {
        tipsmeeeId
        webPageUrl
        facebookUrl
        twitterUrl
      }
    }
  }
`;

describe('Internal|create proposal', () => {
  const input = {
    proposalFormId: 'proposalformCafetier',
    title: "Au ptit qu'a fait",
    body: 'Au ptit café !',
    theme: 'theme1',
    address:
      '[{"address_components":[{"long_name":"262","short_name":"262","types":["street_number"]},{"long_name":"Avenue Général Leclerc","short_name":"Avenue Général Leclerc","types":["route"]},{"long_name":"Rennes","short_name":"Rennes","types":["locality","political"]},{"long_name":"Ille-et-Vilaine","short_name":"Ille-et-Vilaine","types":["administrative_area_level_2","political"]},{"long_name":"Bretagne","short_name":"Bretagne","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"35700","short_name":"35700","types":["postal_code"]}],"formatted_address":"262 Avenue Général Leclerc, 35700 Rennes, France","geometry":{"bounds":{"northeast":{"lat":48.1140978,"lng":-1.6404985},"southwest":{"lat":48.1140852,"lng":-1.640499}},"location":{"lat":48.1140852,"lng":-1.6404985},"location_type":"RANGE_INTERPOLATED","viewport":{"northeast":{"lat":48.1154404802915,"lng":-1.639149769708498},"southwest":{"lat":48.1127425197085,"lng":-1.641847730291502}}},"place_id":"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ","types":["street_address"]}]',
    tipsmeeeId: 'A956Ibs5Z',
  };
  it('create proposal', async () => {
    await enableFeatureFlag('unstable__tipsmeee');
    await enableFeatureFlag('districts');
    // expect.assertions(1);
    const response = await graphql(createProposal, { input }, 'internal_user');
    expect(response).toMatchSnapshot();
    expect(response.createProposal.proposal.tipsmeeeId).toBe('A956Ibs5Z');
  });
  it('create proposal with social networks', async () => {
    const input = {
      proposalFormId: 'proposalformIdfBP3',
      title: "j'ai des liens facebook et twitter à vendre",
      body: 'Viens on va trash talk comme des haters sur les RS',
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
          question: toGlobalId('SimpleQuestion', '1393'),
          value: 'ERL',
        },
      ],
    };
    // expect.assertions(1);
    const response = await graphql(createProposal, { input }, 'internal_user');

    expect(response).toMatchSnapshot();
  });
});
