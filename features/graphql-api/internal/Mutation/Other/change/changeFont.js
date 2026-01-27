/* eslint-env jest */
import '../../../../_setupDB'

const ChangeFontMutation = /* GraphQL */ `
  mutation ChangeFontMutation($input: ChangeFontInput!) {
    changeFont(input: $input) {
      fonts {
        id
        name
        useAsBody
        useAsHeading
      }
    }
  }
`

describe('Internal|changeFont mutation', () => {
  it('sets Courier as a heading font and Geneva as a body font', async () => {
    const courierId = toGlobalId('Font', 'courierFont')
    const genevaId = toGlobalId('Font', 'genevaFont')

    const response = await graphql(
      ChangeFontMutation,
      {
        input: {
          heading: courierId,
          body: genevaId,
        },
      },
      'internal_admin',
    )

    expect(response.changeFont.fonts.find(f => f.id === courierId).useAsHeading).toBe(true)
    expect(response.changeFont.fonts.find(f => f.id === genevaId).useAsBody).toBe(true)
    expect(response).toMatchSnapshot()
  })
})
