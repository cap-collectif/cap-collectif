/* eslint-env jest */
const ConsultationOwnerConsultationQuery = /* GraphQL */ `
  query ConsultationOwnerConsultationQuery {
    viewer {
      consultations {
        totalCount
        edges {
          node {
            title
          }
        }
      }
    }
  }
`;


describe('Internal.consultationOwner.consultations', () => {
  it('should fetch all consultations as an admin', async () => {
    await expect(
      graphql(
        ConsultationOwnerConsultationQuery,
        {},
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
})