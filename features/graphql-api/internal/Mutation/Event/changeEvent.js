/* eslint-env jest */
import '../../../_setup'

const ChangeEventMutation = /* GraphQL*/ `
    mutation ChangeEventMutation($input: ChangeEventInput!) {
        changeEvent(input: $input) {
            event {
                _id
                id
                title
                body
                url
                commentable
                steps {
                  id
                }
                author {
                  username
                  ...on User {
                    _id
                  }
                }
                timeRange {
                  startAt
                  endAt
                }
                themes {
                  id
                }
                projects {
                  id
                }
                review {
                  createdAt
                  status
                  reviewer {
                    id
                    username
                  }
                }
                owner {
                    username
                }
                googleMapsAddress {
                  json
                  formatted
                }
                isMeasurable
                maxRegistrations
            }
            userErrors {
              message
            }
        }
    }
`

const input = {
  translations: [
    {
      title: 'title is updated',
      body: 'body is updated',
      locale: 'FR_FR',
    },
  ],
  startAt: '2020-01-01',
  guestListEnabled: false,
  measurable: true,
  maxRegistrations: 50,
}

describe('mutations.createEvent', () => {
  it('should update an event that a project admin owns', async () => {
    const response = await graphql(
      ChangeEventMutation,
      {
        input: {
          ...input,
          id: 'RXZlbnQ6ZXZlbnRXaXRoT3duZXI=',
        },
      },
      'internal_theo',
    )

    expect(response.changeEvent.event.title).toBe('title is updated')
    expect(response.changeEvent.event.body).toBe('body is updated')
    expect(response.changeEvent.event.owner.username).toBe('Théo QP')
    expect(response.changeEvent.event.author.username).toBe('Théo QP')
    expect(response.changeEvent.event.isMeasurable).toBe(true)
    expect(response.changeEvent.event.maxRegistrations).toBe(50)
  })

  it('should have an error when attempting to update a unknown event.', async () => {
    await expect(
      graphql(ChangeEventMutation, { input: { ...input, id: 'abc' } }, 'internal_admin'),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('should throw error if project admin user attempt to update an event that he does not own', async () => {
    await expect(
      graphql(ChangeEventMutation, { input: { ...input, id: 'RXZlbnQ6ZXZlbnQz' } }, 'internal_theo'),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('Admin wants to change an event', async () => {
    await expect(
      graphql(
        ChangeEventMutation,
        {
          input: {
            id: 'RXZlbnQ6ZXZlbnQx',
            startAt: '2018-04-07 00:00:00',
            endAt: '2018-05-16 00:00:00',
            themes: ['theme1', 'theme2'],
            guestListEnabled: true,
            translations: [
              {
                locale: 'FR_FR',
                title: 'Rencontre avec les habitants',
                body: 'Tout le monde est invité',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin wants to change an event with external to register', async () => {
    await expect(
      graphql(
        ChangeEventMutation,
        {
          input: {
            id: 'RXZlbnQ6ZXZlbnQx',
            startAt: '2018-04-07 00:00:00',
            endAt: '2018-05-16 00:00:00',
            themes: ['theme1', 'theme2'],
            translations: [
              {
                locale: 'FR_FR',
                title: 'Rencontre avec les habitants',
                body: 'Tout le monde est invité',
                link: 'http://perdu.com',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('User wants to change an event', async () => {
    await expect(
      graphql(
        ChangeEventMutation,
        {
          input: {
            id: 'RXZlbnQ6ZXZlbnQx',
            startAt: '2018-03-07 00:00:00',
            customCode: 'customCode',
            guestListEnabled: true,
            translations: [
              {
                locale: 'FR_FR',
                title: 'Rencontre avec les habitants',
                body: 'Tout le monde est invité',
              },
            ],
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('User wants to change his refused event', async () => {
    await expect(
      graphql(
        ChangeEventMutation,
        {
          input: {
            id: 'RXZlbnQ6ZXZlbnRDcmVhdGVCeUFVc2VyUmV2aWV3UmVmdXNlZA==',
            startAt: '2018-03-07 00:00:00',
            guestListEnabled: true,
            translations: [
              {
                locale: 'FR_FR',
                title: 'Rencontre avec les habitants',
                body: 'Tout le monde est invité',
                link: 'http://perdu.com',
              },
            ],
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin wants to change an event to add steps', async () => {
    await expect(
      graphql(
        ChangeEventMutation,
        {
          input: {
            id: 'RXZlbnQ6ZXZlbnQx',
            startAt: '2018-03-07 00:00:00',
            guestListEnabled: true,
            steps: ['Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOA=='],
            translations: [
              {
                locale: 'FR_FR',
                title: 'Rencontre avec les habitants',
                body: 'Tout le monde est invité',
                link: 'http://perdu.com',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      changeEvent: {
        event: {
          timeRange: {
            endAt: expect.any(String),
          },
        },
      },
    })
  })
})
