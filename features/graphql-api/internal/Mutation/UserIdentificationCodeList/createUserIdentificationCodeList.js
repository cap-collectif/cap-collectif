import '../../../_setup'

const UserIdentificationCodeListMutation = /* GraphQL */ `
  mutation ($input: CreateUserIdentificationCodeListInput!) {
    createUserIdentificationCodeList(input: $input) {
      userIdentificationCodeList {
        id
        name
        codesCount
        alreadyUsedCount
      }
    }
  }
`

describe('mutations.userIdentificationCodeListMutation', () => {
  it('API client wants to create a list but is not admin', async () => {
    await expect(
      graphql(
        UserIdentificationCodeListMutation,
        {
          input: {
            name: 'ben voyons',
            data: [
              {
                title: 'm',
                firstname: 'théo',
                lastname: 'QP',
                address1: 'non',
                zipCode: '00001',
                city: 'théoville',
                country: 'portougal',
              },
            ],
          },
        },
        'internal_theo',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('API admin creates a list', async () => {
    await expect(
      graphql(
        UserIdentificationCodeListMutation,
        {
          input: {
            name: 'La team backend',
            data: [
              {
                title: 'm',
                firstname: 'Théo',
                lastname: 'Bourgoin',
                address1: '25 rue Claude Tillier',
                zipCode: '75011',
                city: 'Paris',
                country: 'France',
              },
              {
                title: 'm',
                firstname: 'Alex',
                lastname: 'Tea',
                address1: '25 rue Claude Tillier',
                zipCode: '75011',
                city: 'Paris',
                country: 'France',
              },
              {
                title: 'm',
                firstname: 'Maxime',
                lastname: 'Auriau',
                address1: '25 rue Claude Tillier',
                zipCode: '75011',
                city: 'Paris',
                country: 'France',
              },
              {
                title: 'm',
                firstname: 'Mickaël',
                lastname: 'Buliard',
                address1: '25 rue Claude Tillier',
                zipCode: '75011',
                city: 'Paris',
                country: 'France',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createUserIdentificationCodeList: {
        userIdentificationCodeList: {
          id: expect.any(String),
        },
      },
    })
  })

  it('API admin creates a list with 8 length code', async () => {
    await expect(
      graphql(
        UserIdentificationCodeListMutation,
        {
          input: {
            name: 'La team backend',
            data: [
              {
                title: 'm',
                firstname: 'Théo',
                lastname: 'Bourgoin',
                address1: '25 rue Claude Tillier',
                zipCode: '75011',
                city: 'Paris',
                country: 'France',
              },
              {
                title: 'm',
                firstname: 'Alex',
                lastname: 'Tea',
                address1: '25 rue Claude Tillier',
                zipCode: '75011',
                city: 'Paris',
                country: 'France',
              },
              {
                title: 'm',
                firstname: 'Maxime',
                lastname: 'Auriau',
                address1: '25 rue Claude Tillier',
                zipCode: '75011',
                city: 'Paris',
                country: 'France',
              },
              {
                title: 'm',
                firstname: 'Mickaël',
                lastname: 'Buliard',
                address1: '25 rue Claude Tillier',
                zipCode: '75011',
                city: 'Paris',
                country: 'France',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createUserIdentificationCodeList: {
        userIdentificationCodeList: {
          id: expect.any(String),
        },
      },
    })
  })
})
