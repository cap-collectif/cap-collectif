/* eslint-env jest */
const ConsultationListBoxQuery = /* GraphQL */ `
  query ConsultationListBoxQuery($consultationStepId: ID!) {
    step: node(id: $consultationStepId) {
      ... on ConsultationStep {
        consultations {
          edges {
            node {
              id
              title
              url
            }
          }
        }
      }
    }
  }
`;

const ConsultationPropositionBoxQuery = /* GraphQL */ `
  query ConsultationPropositionBoxQuery($consultationStepId: ID!, $consultationSlug: String!) {
    step: node(id: $consultationStepId) {
      ... on ConsultationStep {
        consultation(slug: $consultationSlug) {
          id
          title
          url
        }
      }
    }
  }
`;

describe('Internal|Query step.consultations connection', () => {
  it('fetches the correct consultations', async () => {
    await expect(
      graphql(
        ConsultationListBoxQuery,
        {
          consultationStepId: 'Q29uc3VsdGF0aW9uU3RlcDptdWx0aUNzdGVwMQ==',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});

describe('Internal|Query step.consultation', () => {
  it('fetches the correct first consultation by slug of the step', async () => {
    await expect(
      graphql(
        ConsultationPropositionBoxQuery,
        {
          consultationStepId: 'Q29uc3VsdGF0aW9uU3RlcDptdWx0aUNzdGVwMQ==',
          consultationSlug: 'premiere-consultation',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('fetches the correct second consultation by slug of the step', async () => {
    await expect(
      graphql(
        ConsultationPropositionBoxQuery,
        {
          consultationStepId: 'Q29uc3VsdGF0aW9uU3RlcDptdWx0aUNzdGVwMQ==',
          consultationSlug: 'deuxieme-consultation',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});
