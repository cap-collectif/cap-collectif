/* eslint-env jest*/
import '../../_setup';

const ConfigureAnalysisMutation = /* GraphQL */ `
  mutation ConfigureAnalysisMutation($input: ConfigureAnalysisInput!) {
    configureAnalysis(input: $input) {
      analysisConfiguration {
        id
        effectiveDate
        analysisStep {
          id
        }
        moveToSelectionStep {
          id
        }
        selectionStepStatus {
          id
        }
        proposalForm {
          id
        }
        unfavourableStatuses {
          id
        }
        favourableStatus {
          id
        }
      }
    }
  }
`;

describe('mutations.configureAnalysis', () => {
  it('should modify specified analysis configuration', async () => {
    const modifyAnalysisConfiguration = await graphql(
      ConfigureAnalysisMutation,
      {
        input: {
          proposalFormId: 'proposalform17',
          analysisStepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAxMw==',
          moveToSelectionStepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOQ==',
          selectionStepStatusId: 'status11',
          effectiveDate: '2020-03-01 12:00:00',
          unfavourableStatuses: ['status8', 'status9'],
          favourableStatus: 'status10',
          costEstimationEnabled: true,
        },
      },
      'internal_admin',
    );
    expect(modifyAnalysisConfiguration).toMatchSnapshot({
      configureAnalysis: {
        analysisConfiguration: {
          id: expect.any(String),
        },
      },
    });
  });

  it('should modify analysis configuration without moveToSelectionStepId', async () => {
    const modifyAnalysisConfiguration = await graphql(
      ConfigureAnalysisMutation,
      {
        input: {
          proposalFormId: 'proposalform17',
          analysisStepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAxMw==',
          selectionStepStatusId: 'status11',
          effectiveDate: '2020-03-01 12:00:00',
          unfavourableStatuses: ['status8', 'status9'],
          favourableStatus: 'status10',
          costEstimationEnabled: true,
        },
      },
      'internal_admin',
    );
    expect(modifyAnalysisConfiguration).toMatchSnapshot({
      configureAnalysis: {
        analysisConfiguration: {
          id: expect.any(String),
        },
      },
    });
  });

  it('should remove unfavourable status from analysisConfiguration', async () => {
    const modifyAnalysisConfiguration = await graphql(
      ConfigureAnalysisMutation,
      {
        input: {
          proposalFormId: 'proposalform17',
          analysisStepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAxMw==',
          moveToSelectionStepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOQ==',
          effectiveDate: '2020-03-01 12:00:00',
          unfavourableStatuses: ['status8'],
          favourableStatus: 'status10',
          costEstimationEnabled: true,
        },
      },
      'internal_admin',
    );
    expect(modifyAnalysisConfiguration).toMatchSnapshot({
      configureAnalysis: {
        analysisConfiguration: {
          id: expect.any(String),
        },
      },
    });
  });
});
