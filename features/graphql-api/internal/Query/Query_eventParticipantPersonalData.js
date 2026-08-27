/* eslint-env jest */

const EventAttendeeEmailQuery = /* GraphQL */ `
  query EventAttendeeEmailQuery($eventId: ID!) {
    event: node(id: $eventId) {
      ... on Event {
        participants(first: 5) {
          edges {
            node {
              __typename
              ... on NotRegistered {
                email
              }
            }
          }
        }
      }
    }
  }
`

describe('Internal|Event participant personal data', () => {
  it('hides non-registered attendee emails from anonymous viewers', async () => {
    const response = await rawInternalGraphql(EventAttendeeEmailQuery, {
      eventId: toGlobalId('Event', 'event1'),
    })
    const attendees = response.data.event.participants.edges.filter(edge => edge.node.__typename === 'NotRegistered')

    expect(attendees).not.toHaveLength(0)
    expect(attendees.every(edge => edge.node.email === null)).toBe(true)
    expect(response.extensions.warnings).toEqual(
      expect.arrayContaining([expect.objectContaining({ message: 'Access denied to this field.' })]),
    )
  })
})
