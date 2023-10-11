/* eslint-env jest */
import '../../../../_setup';

const UpdateNewProjectMutation = /* GraphQL */ `
  mutation UpdateNewProjectMutation($input: UpdateNewProjectInput!) {
    updateNewProject(input: $input) {
      project {
        title
        description
        publishedAt
        locale {
          code
        }
        url
        archived
        slug
        metaDescription
        authors {
          __typename
          displayName
        }
        type {
          title
        }
        cover {
          url
        }
        themes {
          title
        }
        districts {
          edges {
            node {
              name
            }
          }
        }
        steps {
          __typename
          title
          body
        }
        visibility 
        restrictedViewers {
          edges {
            node {
              title
            }
          }
        }
        address {
          formatted
          json
        }
        opinionCanBeFollowed
        isExternal
        externalLink
        customCode
      }
    }
  }
`;

const input = {
  "projectId": "UHJvamVjdDpwcm9qZWN0SWRmMw==",
  "title": "Budget Participatif IdF 3 zzzz",
  "description": "Project Description",
  "authors": [
    "VXNlcjp1c2VyQWRtaW4=",
    "VXNlcjp1c2VyODc=",
    "VXNlcjp1c2VyODg="
  ],
  "projectType": "4",
  "video": "",
  "themes": [
    "theme4"
  ],
  "districts": [
    "RGlzdHJpY3Q6cHJvamVjdERpc3RyaWN0Mw=="
  ],
  "metaDescription": "metadescription",
  "isExternal": false,
  "publishedAt": "2021-05-01 12:00:00",
  "visibility": "CUSTOM",
  "address": "[{\"address_components\":[{\"long_name\":\"Rue Claude Tillier\",\"short_name\":\"Rue Claude Tillier\",\"types\":[\"route\"]},{\"long_name\":\"Paris\",\"short_name\":\"Paris\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Département de Paris\",\"short_name\":\"Département de Paris\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Île-de-France\",\"short_name\":\"IDF\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"75012\",\"short_name\":\"75012\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"Rue Claude Tillier, 75012 Paris, France\",\"geometry\":{\"bounds\":{\"south\":48.847326,\"west\":2.3869495,\"north\":48.8493632,\"east\":2.3896115},\"location\":{\"lat\":48.8483203,\"lng\":2.3882419},\"location_type\":\"GEOMETRIC_CENTER\",\"viewport\":{\"south\":48.84699561970849,\"west\":2.386931519708499,\"north\":48.84969358029149,\"east\":2.389629480291502}},\"place_id\":\"ChIJSQHl0Qxy5kcRn6k49MY9yWo\",\"types\":[\"route\"]}]",
  "restrictedViewerGroups": [
    "R3JvdXA6Z3JvdXAy",
    "R3JvdXA6Z3JvdXAx"
  ],
  "steps": [
    "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBJZGYz",
    "Q29sbGVjdFN0ZXA6Y29sbGVjdFN0ZXBDbG9zZWRJZGYz",
    "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwSWRmM0FuYWx5c2U=",
    "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwSWRmM1ZvdGU=",
    "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwSWQzZldpbm5lcnM=",
    "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBTbXNWb3RlSWRmMw=="
  ],
  "opinionCanBeFollowed": true,
  "locale": null,
  "archived": true,
  "customCode": "custom code"
}

describe('Internal|UpdateNewProject mutation', () => {
  it('admin should be able to update a project.', async () => {
    const response = await graphql(
      UpdateNewProjectMutation,
      {
        input,
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });

  it('removing description should remove the presentation step containing the description', async () => {
    const response = await graphql(
      UpdateNewProjectMutation,
      {
        input: {
          ...input,
          description: null
        }
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
})