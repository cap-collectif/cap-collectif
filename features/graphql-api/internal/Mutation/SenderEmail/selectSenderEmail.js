/* eslint-env jest */
import '../../../_setup'

beforeEach(async () => {
  await global.enableFeatureFlag('emailing')
})

const SelectSenderEmailMutation = /* GraphQL*/ `
    mutation ($input: SelectSenderEmailInput!) {
      selectSenderEmail(input: $input) {
        senderEmail {
          isDefault
        }
        errorCode
      }
    }
`

describe('mutations.selectSenderEmail', () => {
  it('Admin tries to select a non existing SenderEmail', async () => {
    await expect(
      graphql(
        SelectSenderEmailMutation,
        {
          input: {
            senderEmail: 'l_existence_est_en_tant_que_telle_decision_d_existence',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin select a SenderEmail', async () => {
    await expect(
      graphql(
        SelectSenderEmailMutation,
        {
          input: {
            senderEmail: 'U2VuZGVyRW1haWw6ZGV2LWNhcGNv',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
