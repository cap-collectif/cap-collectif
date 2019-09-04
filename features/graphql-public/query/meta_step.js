/* eslint-env jest */
const MetaStepNavigationBoxQuery = /* GraphQL */ `
  query MetaStepNavigationBoxQuery($stepId: ID!, $relatedSlug: String!) {
    step: node(id: $stepId) {
      __typename
      ... on ConsultationStep {
        consultation(slug: $relatedSlug) {
          url
          title
          id
        }
      }
    }
  }
`;

describe('Internal|Query step related module', () => {
  it('fetches the correct related module when in a ConsultationStep (consultation)', async () => {
    await expect(
      graphql(
        MetaStepNavigationBoxQuery,
        {
          stepId: 'Q29uc3VsdGF0aW9uU3RlcDptdWx0aUNzdGVwMQ==',
          relatedSlug: 'premiere-consultation',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});

// In the future, we would test other modules for example by doing

// const MetaStepNavigationBoxQuery = /* GraphQL */ `
//   query MetaStepNavigationBoxQuery($stepId: ID!, $relatedSlug: String!) {
//     step: node(id: $stepId) {
//       __typename
//       ...on ConsultationStep {
//         consultation(slug: $relatedSlug) {
//           url
//           title
//           id
//         }
//       }
//       ...on QuestionnaireStep {
//         questionnaire(slug: $relatedSlug) {
//           url
//           title
//           id
//         }
//       }
//     }
//   }
// `;

// describe('Internal|Query step related module', () => {
//   it('fetches the correct related module when in a QuestionnaireStep (questionnaire)', async () => {
//     await expect(graphql(MetaStepNavigationBoxQuery, {
//       stepId: 'questionnaireStepId',
//       relatedSlug: 'mon-super-questionnaire'
//     }, 'internal')).resolves.toMatchSnapshot();
//   });
// });
// and MetaStepNavigationBoxQuery const with the following value
