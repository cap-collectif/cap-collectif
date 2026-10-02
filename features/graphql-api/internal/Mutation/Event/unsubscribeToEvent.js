/* eslint-env jest */
import '../../../_setupDB'

const UnsubscribeToEventAsRegisteredMutation = /* GraphQL*/ `
  mutation UnsubscribeToEventAsRegistered($input: UnsubscribeToEventAsRegisteredInput!) {
    unsubscribeToEventAsRegistered(input: $input) {
      event{
        id
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('mutations.unsubscribeToEvent', () => {
  it('admin wants to unsubscribe from event.', async () => {
    const unsubscribeToEvent = await graphql(
      UnsubscribeToEventAsRegisteredMutation,
      {
        input: { eventId: 'RXZlbnQ6ZXZlbnQ0' },
      },
      'internal_spylou',
    )
    expect(unsubscribeToEvent).toMatchSnapshot()
  })

  it('user wants to unsubscribe from event.', async () => {
    const unsubscribeToEvent = await graphql(
      UnsubscribeToEventAsRegisteredMutation,
      {
        input: { eventId: 'RXZlbnQ6ZXZlbnQ0' },
      },
      'internal_saitama',
    )
    expect(unsubscribeToEvent).toMatchSnapshot()
  })
})
