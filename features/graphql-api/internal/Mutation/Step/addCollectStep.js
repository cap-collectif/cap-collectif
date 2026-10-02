/* eslint-env jest */
import '../../../_setupDB'

const AddCollectStep = /* GraphQL*/ `
  mutation AddCollectStep($input: AddStepInput!) {
    addCollectStep(input: $input) {
      step {
        __typename
        title
        ...on CollectStep {
          requirements {
            edges {
              node {
                __typename
              }
            }
          }
          form {
            allowAknowledge
            title
            creator {
              username
            }
            owner {
              username
            }
          }
        }
      }
    }
  }
`

const ToggleFeature = /* GraphQL */ `
  mutation ToggleFeature($input: ToggleFeatureInput!) {
    toggleFeature(input: $input) {
      featureFlag {
        enabled
      }
    }
  }
`

describe('mutations.addCollectStepMutation', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('admin should be able to add collect step.', async () => {
    const response = await graphql(
      AddCollectStep,
      { input: { projectId: toGlobalId('Project', 'project9') } },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('admin project should be able to add collect step.', async () => {
    const response = await graphql(
      AddCollectStep,
      { input: { projectId: toGlobalId('Project', 'projectWithOwner') } },
      'internal_theo',
    )
    expect(response).toMatchSnapshot()
  })
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('orga member should be able to add collect step.', async () => {
    const response = await graphql(
      AddCollectStep,
      { input: { projectId: toGlobalId('Project', 'projectOrgaVisibilityMe') } },
      'internal_christophe',
    )
    expect(response).toMatchSnapshot()
  })
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('proposal form owner should be organization when admin create the step in a project owned by an organization.', async () => {
    const response = await graphql(
      AddCollectStep,
      { input: { projectId: toGlobalId('Project', 'projectOrgaVisibilityAdminAndMe') } },
      'internal_super_admin',
    )
    expect(response).toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
   * the database helper runs only before each test.
   */
  it('uses SSO instead of email verification when SSO bypass authentication is enabled.', async () => {
    await graphql(ToggleFeature, { input: { type: 'sso_by_pass_auth', enabled: true } }, 'internal_super_admin')

    const response = await graphql(
      AddCollectStep,
      { input: { projectId: toGlobalId('Project', 'project9') } },
      'internal_admin',
    )

    expect(response.addCollectStep.step.requirements.edges).toEqual([
      {
        node: {
          __typename: 'SSORequirement',
        },
      },
    ])
  })
})
