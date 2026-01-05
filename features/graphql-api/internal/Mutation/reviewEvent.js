/* eslint-env jest */
import '../../_setup'

const ReviewEventMutation = /* GraphQL*/ `
    mutation ($input: ReviewEventInput!) {
      reviewEvent(input: $input) {
        event {
          _id
          review {
            createdAt
            status
            reviewer {
              _id
            }
            refusedReason
          }
        }
      }
    }
`

describe('mutations.reviewEventMutation', () => {
  it('Admin approved an event in awaiting status', async () => {
    await expect(
      graphql(
        ReviewEventMutation,
        {
          input: {
            id: 'RXZlbnQ6ZXZlbnRDcmVhdGVCeUFVc2VyUmV2aWV3QXdhaXRpbmc=',
            status: 'APPROVED',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin refused an event in awaiting status', async () => {
    await expect(
      graphql(
        ReviewEventMutation,
        {
          input: {
            id: 'RXZlbnQ6ZXZlbnRDcmVhdGVCeUFVc2VyUmV2aWV3QXdhaXRpbmc=',
            status: 'REFUSED',
            refusedReason: 'SPAM',
            comment: 'On se calme sur le SPAM, merci.',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin try to review an event ever approved', async () => {
    await expect(
      graphql(
        ReviewEventMutation,
        {
          input: {
            id: 'RXZlbnQ6ZXZlbnRDcmVhdGVCeUFVc2VyUmV2aWV3QXBwcm92ZWQ=',
            status: 'REFUSED',
            refusedReason: 'SPAM',
            comment: 'On se calme sur le SPAM, merci.',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('SuperAdmin change review of event ever approved', async () => {
    await expect(
      graphql(
        ReviewEventMutation,
        {
          input: {
            id: 'RXZlbnQ6ZXZlbnRDcmVhdGVCeUFVc2VyUmV2aWV3QXBwcm92ZWQ=',
            status: 'REFUSED',
            refusedReason: 'SPAM',
            comment: 'On se calme sur le SPAM, merci.',
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
