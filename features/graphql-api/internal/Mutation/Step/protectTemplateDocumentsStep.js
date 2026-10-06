/* eslint-env jest */
import '../../../_setupDB'

const AddOtherStep = /* GraphQL */ `
  mutation AddOtherStep($input: AddStepInput!) {
    addOtherStep(input: $input) {
      step {
        id
      }
    }
  }
`

const DeleteStep = /* GraphQL */ `
  mutation DeleteStep($input: DeleteStepInput!) {
    deleteStep(input: $input) {
      stepId
    }
  }
`

const UpdateOtherStep = /* GraphQL */ `
  mutation UpdateOtherStepMutation($input: UpdateOtherStepInput!) {
    updateOtherStep(input: $input) {
      step {
        id
        hubMetadata {
          enabled
          aiotCode
          folderNumber
          contactEmail
        }
      }
    }
  }
`

const OtherStep = /* GraphQL */ `
  query OtherStep($id: ID!) {
    node(id: $id) {
      ... on OtherStep {
        hubMetadata {
          enabled
          aiotCode
          folderNumber
          contactEmail
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

const protectedStepId = toGlobalId('OtherStep', 'ostep1')
const projectId = toGlobalId('Project', 'project1')

const setHubApiGreen = enabled =>
  graphql(
    ToggleFeature,
    { input: { type: 'hub_api_green', enabled } },
    'internal_super_admin',
  )

beforeEach(async () => {
  await setHubApiGreen(true)
})

const createProtectedDocumentsStep = async projectTypeSlug => {
  await global.runSQL(
    `UPDATE project SET project_type_id = (SELECT id FROM project_type WHERE slug = "${projectTypeSlug}") WHERE id = "project1"`,
  )
  await global.runSQL(
    'UPDATE step SET label = "Documents et ressources", body = "<p>Contenu initial</p>", timeless = 1 WHERE id = "ostep1"',
  )
  await global.runSQL(
    'INSERT INTO hub_metadata (id, step_id, project_id, enabled, aiot_code, folder_number, contact_email) VALUES (UUID(), "ostep1", "project1", 1, "0003013833", "T0603151600", "contact@example.com") ON DUPLICATE KEY UPDATE project_id = "project1", enabled = 1, aiot_code = "0003013833", folder_number = "T0603151600", contact_email = "contact@example.com"',
  )
}

describe.each(['public-inquiry', 'public-consultation'])('protected documents step for project type %s', projectType => {
  it('cannot be deleted', async () => {
    await createProtectedDocumentsStep(projectType)

    await expect(
      graphql(
        DeleteStep,
        { input: { stepId: protectedStepId, deleteRelatedResource: true } },
        'internal_admin',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('still allows deleting another custom step in the same project', async () => {
    await createProtectedDocumentsStep(projectType)
    const response = await graphql(AddOtherStep, { input: { projectId } }, 'internal_admin')

    await expect(
      graphql(
        DeleteStep,
        { input: { stepId: response.addOtherStep.step.id, deleteRelatedResource: true } },
        'internal_admin',
      ),
    ).resolves.toMatchObject({ deleteStep: { stepId: expect.any(String) } })
  })

  it('allows deleting the documents step when Hub API Green is disabled', async () => {
    await createProtectedDocumentsStep(projectType)
    await setHubApiGreen(false)

    try {
      await expect(
        graphql(
          DeleteStep,
          { input: { stepId: protectedStepId, deleteRelatedResource: true } },
          'internal_admin',
        ),
      ).resolves.toMatchObject({ deleteStep: { stepId: expect.any(String) } })
    } finally {
      await setHubApiGreen(true)
    }
  })

  it('keeps Hub metadata when the association is disabled', async () => {
    await createProtectedDocumentsStep(projectType)

    const input = {
      label: 'Documents et ressources',
      body: '<p>Contenu initial</p>',
      isEnabled: true,
      metaDescription: 'Description',
      customCode: '',
      timeless: true,
      operationType: 'EDIT',
      stepId: protectedStepId,
      hubMetadata: { enabled: false },
    }

    await expect(graphql(UpdateOtherStep, { input }, 'internal_admin')).resolves.toMatchObject({
      updateOtherStep: {
        step: {
          hubMetadata: {
            enabled: false,
            aiotCode: '0003013833',
            folderNumber: 'T0603151600',
            contactEmail: 'contact@example.com',
          },
        },
      },
    })

    await expect(graphql(OtherStep, { id: protectedStepId }, 'internal_admin')).resolves.toMatchObject({
      node: {
        hubMetadata: {
          enabled: false,
          aiotCode: '0003013833',
          folderNumber: 'T0603151600',
          contactEmail: 'contact@example.com',
        },
      },
    })
  })

})
