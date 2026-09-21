/* eslint-env jest */
import '../../../_setupDB'

const PerformanceSettingsQuery = /* GraphQL */ `
  query {
    performanceSettings {
      id
      keyname
    }
  }
`

const SiteParameterQuery = /* GraphQL */ `
  query ($keyname: String!) {
    siteParameter(keyname: $keyname) {
      id
    }
  }
`

const UpdatePerformanceSettingMutation = /* GraphQL */ `
  mutation ($input: UpdatePerformanceSettingInput!) {
    updatePerformanceSetting(input: $input) {
      errorCode
      siteParameter {
        keyname
        value
        isEnabled
      }
    }
  }
`

const getProposalPaginationId = async () => {
  const data = await graphql(PerformanceSettingsQuery, {}, 'internal_super_admin')
  return data.performanceSettings.find(param => 'proposal.pagination' === param.keyname).id
}

const getSiteParameterId = async keyname => {
  const data = await graphql(SiteParameterQuery, { keyname }, 'internal_super_admin')
  return data.siteParameter.id
}

describe('Internal|updatePerformanceSetting', () => {
  it('updates the value and isEnabled as super-admin', async () => {
    const id = await getProposalPaginationId()

    await expect(
      graphql(
        UpdatePerformanceSettingMutation,
        { input: { id, value: '25', isEnabled: false } },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('denies the mutation as admin', async () => {
    const id = await getProposalPaginationId()

    await expect(
      graphql(UpdatePerformanceSettingMutation, { input: { id, value: '25', isEnabled: false } }, 'internal_admin'),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('returns INVALID_VALUE for a non-positive integer value', async () => {
    const id = await getProposalPaginationId()

    await expect(
      graphql(
        UpdatePerformanceSettingMutation,
        { input: { id, value: '0', isEnabled: false } },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('returns SITE_PARAMETER_NOT_FOUND for a parameter outside the settings.performance category', async () => {
    const id = await getSiteParameterId('global.site.fullname')

    await expect(
      graphql(
        UpdatePerformanceSettingMutation,
        { input: { id, value: '25', isEnabled: false } },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
