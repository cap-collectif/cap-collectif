/* eslint-env jest */
import '../../../_setup'

const DeleteSource = /* GraphQL*/ `
  mutation DeleteSource($input: DeleteSourceInput!) {
    deleteSource(input: $input) {
      sourceable {
        id
      }
      deletedSourceId
    }
  }
`

const input = {
  sourceId: toGlobalId('Source', 'source6'), //U291cmNlOnNvdXJjZTY=
}

describe('mutations.deleteSource', () => {
  it('should delete a Source as an admin', async () => {
    const response = await graphql(
      DeleteSource,
      {
        input,
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })

  it('Author wants to delete his source', async () => {
    await expect(
      graphql(
        DeleteSource,
        {
          input: {
            sourceId: 'U291cmNlOnNvdXJjZTE=',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('User wants to delete an source but is not the author', async () => {
    await expect(
      graphql(
        DeleteSource,
        {
          input: {
            sourceId: 'U291cmNlOnNvdXJjZTE=',
          },
        },
        'internal_kiroule',
      ),
    ).rejects.toThrowError('You are not the author of source with id: source1')
  })

  it('User wants to delete an source without requirements', async () => {
    await expect(
      graphql(
        DeleteSource,
        {
          input: {
            sourceId: 'U291cmNlOnNvdXJjZTQx',
          },
        },
        'internal_jean',
      ),
    ).rejects.toThrowError('You dont meets all the requirements.')
  })
})
