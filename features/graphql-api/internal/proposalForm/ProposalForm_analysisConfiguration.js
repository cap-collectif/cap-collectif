const AnalysisConfigurationQuery = /** GraphQL */ `
  query AnalysisConfigurationQuery($id: ID!) {
    collectstep: node(id: $id) {
      ...on CollectStep {
        form {
          id
          analysisConfiguration {
            analysisStep {
              id
            }
            evaluationForm {
              id
            }
            effectiveDate
            favourableStatus {
              id
              name
            }
            unfavourableStatuses {
              id
              name
            }
          }
        }
      }
    } 
  }
`;

describe('ProposalForm.analysisConfiguration', () => {
  it("does not fetch proposal form's analysis configuration when authenticated as user", async () => {
    await expect(
      graphql(
        AnalysisConfigurationQuery,
        {
          id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAxMw==',
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
});
