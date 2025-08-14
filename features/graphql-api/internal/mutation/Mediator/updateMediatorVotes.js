/* eslint-env jest */
import '../../../_setup';


const UpdateMediatorVotesMutation = /* GraphQL*/ `
  mutation UpdateMediatorVotes($input: UpdateMediatorVotesInput!) {
    updateMediatorVotes(input: $input) {
      mediator {
        votes {
          totalCount
          edges {
            node {
              isAccounted
              participant {
                email
                firstname
                lastname
                postalAddress {
                   json
                }
                dateOfBirth
                phone
              }
            }
          }
        }
      }
    }
  }
`

describe('mutations|updateMediatorVotes', () => {
  beforeEach(async () => {
    await global.enableFeatureFlag('mediator');
  });

  it('Mediator update votes participant Infos and remove one proposal.', async () => {
    const variables = {
      "input": {
        "participantInfos": {
          "email": "toto.update@gmail.com",
          "firstname": "toto update",
          "lastname": "tata update",
          "dateOfBirth": "1995-10-01 00:00:00",
          "postalAddress": "[{\"address_components\":[{\"long_name\":\"10\",\"short_name\":\"10\",\"types\":[\"street_number\"]},{\"long_name\":\"RuedelaSavate\",\"short_name\":\"RuedelaSavate\",\"types\":[\"route\"]},{\"long_name\":\"Awans\",\"short_name\":\"Awans\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Liège\",\"short_name\":\"LG\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"RégionWallonne\",\"short_name\":\"RégionWallonne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"Belgium\",\"short_name\":\"BE\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"4340\",\"short_name\":\"4340\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"RuedelaSavate10,4340Awans,Belgium\",\"geometry\":{\"location\":{\"lat\":50.7228035,\"lng\":5.464624},\"location_type\":\"ROOFTOP\",\"viewport\":{\"south\":50.7214585197085,\"west\":5.463225469708497,\"north\":50.72415648029149,\"east\":5.465923430291502}},\"place_id\":\"ChIJ1T224zPjwEcR1kNhE8iPg_k\",\"plus_code\":{\"compound_code\":\"PFF7+4RAwans,Belgium\",\"global_code\":\"9F27PFF7+4R\"},\"types\":[\"street_address\"]}]",
          "phone": "+33601010101"
        },
        "participantId": "UGFydGljaXBhbnQ6cGFydGljaXBhbnQx",
        "mediatorId": "TWVkaWF0b3I6bWVkaWF0b3Ix",
        "proposals": [
          "UHJvcG9zYWw6cHJvcG9zYWwy"
        ]
      }
    }

    const updateMediatorVotes = await graphql(
      UpdateMediatorVotesMutation,
      variables,
      'mediator',
    );
    expect(updateMediatorVotes).toMatchSnapshot();
  });
});
