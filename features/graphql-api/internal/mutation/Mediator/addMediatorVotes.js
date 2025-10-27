/* eslint-env jest */
import '../../../_setup';


const AddMediatorVotesMutation = /* GraphQL*/ `
  mutation AddMediatorVotes($input: AddMediatorVotesInput!) {
    addMediatorVotes(input: $input) {
      mediator {
        votes {
          totalCount
          edges {
            node {
              participant {
                zipCode
                email
                firstname
                lastname
                dateOfBirth
                phone
                postalAddress {
                  json
                }
                votes {
                  edges {
                    node {
                      ... on ProposalVote {
                        proposal {
                          title
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      errors {
          field
          message
      }
    }
  }
`

describe('mutations|addMediatorVotes', () => {
  beforeEach(async () => {
    await global.enableFeatureFlag('mediator');
  });
  it('Mediator add votes.', async () => {
    const variables = {
      "input": {
        "participantInfos": {
          "email": "toto@gmail.com",
          "firstname": "toto",
          "lastname": "tata",
          "dateOfBirth": "1990-10-01 00:00:00",
          "postalAddress": "[{\"address_components\":[{\"long_name\":\"10\",\"short_name\":\"10\",\"types\":[\"street_number\"]},{\"long_name\":\"RuedelaSavate\",\"short_name\":\"RuedelaSavate\",\"types\":[\"route\"]},{\"long_name\":\"Awans\",\"short_name\":\"Awans\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Liège\",\"short_name\":\"LG\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"RégionWallonne\",\"short_name\":\"RégionWallonne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"Belgium\",\"short_name\":\"BE\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"4340\",\"short_name\":\"4340\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"RuedelaSavate10,4340Awans,Belgium\",\"geometry\":{\"location\":{\"lat\":50.7228035,\"lng\":5.464624},\"location_type\":\"ROOFTOP\",\"viewport\":{\"south\":50.7214585197085,\"west\":5.463225469708497,\"north\":50.72415648029149,\"east\":5.465923430291502}},\"place_id\":\"ChIJ1T224zPjwEcR1kNhE8iPg_k\",\"plus_code\":{\"compound_code\":\"PFF7+4RAwans,Belgium\",\"global_code\":\"9F27PFF7+4R\"},\"types\":[\"street_address\"]}]",
          "phone": "+33609090909",
          "zipCode": "77100"
        },
        "mediatorId": "TWVkaWF0b3I6bWVkaWF0b3Ix",
        "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
        "proposals": [
          "UHJvcG9zYWw6cHJvcG9zYWwy",
          "UHJvcG9zYWw6cHJvcG9zYWwz"
        ]
      }
    }
    const response = await graphql(
      AddMediatorVotesMutation,
      variables,
      'mediator',
    );

    const normalizeResponse = response => ({
      ...response,
      addMediatorVotes: {
        ...response.addMediatorVotes,
        mediator: {
          ...response.addMediatorVotes.mediator,
          votes: {
            ...response.addMediatorVotes.mediator.votes,
            edges: response.addMediatorVotes.mediator.votes.edges.map(edge => ({
              ...edge,
              node: {
                ...edge.node,
                participant: {
                  ...edge.node.participant,
                  votes: {
                    ...edge.node.participant.votes,
                    edges: edge.node.participant.votes.edges.sort((a, b) =>
                      a.node.proposal.title.localeCompare(b.node.proposal.title)
                    ),
                  },
                },
              },
            })),
          },
        },
      },
    });

    const normalizedResponse = normalizeResponse(response);
    
    expect(normalizedResponse).toMatchSnapshot();
  });
  it('Should return phone already used error.', async () => {

    await global.runSQL('INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement1234", "selectionstep1", "PHONE_VERIFIED", null, 0)')
    await global.runSQL('UPDATE fos_user SET phone = "+33601010101", phone_confirmed = 1 where id = "user27"')


    const variables = {
      "input": {
        "participantInfos": {
          "email": "toto@gmail.com",
          "firstname": "toto",
          "lastname": "tata",
          "dateOfBirth": "1990-10-01 00:00:00",
          "postalAddress": "[{\"address_components\":[{\"long_name\":\"10\",\"short_name\":\"10\",\"types\":[\"street_number\"]},{\"long_name\":\"RuedelaSavate\",\"short_name\":\"RuedelaSavate\",\"types\":[\"route\"]},{\"long_name\":\"Awans\",\"short_name\":\"Awans\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Liège\",\"short_name\":\"LG\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"RégionWallonne\",\"short_name\":\"RégionWallonne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"Belgium\",\"short_name\":\"BE\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"4340\",\"short_name\":\"4340\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"RuedelaSavate10,4340Awans,Belgium\",\"geometry\":{\"location\":{\"lat\":50.7228035,\"lng\":5.464624},\"location_type\":\"ROOFTOP\",\"viewport\":{\"south\":50.7214585197085,\"west\":5.463225469708497,\"north\":50.72415648029149,\"east\":5.465923430291502}},\"place_id\":\"ChIJ1T224zPjwEcR1kNhE8iPg_k\",\"plus_code\":{\"compound_code\":\"PFF7+4RAwans,Belgium\",\"global_code\":\"9F27PFF7+4R\"},\"types\":[\"street_address\"]}]",
          "phone": "+33601010101",
          "zipCode": "77100"
        },
        "mediatorId": "TWVkaWF0b3I6bWVkaWF0b3Ix",
        "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
        "proposals": [
          "UHJvcG9zYWw6cHJvcG9zYWwy",
          "UHJvcG9zYWw6cHJvcG9zYWwz"
        ]
      }
    }
    const addMediatorVotes = await graphql(
      AddMediatorVotesMutation,
      variables,
      'mediator',
    );
    expect(addMediatorVotes).toMatchSnapshot();
  });
});
