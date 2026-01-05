/* eslint-env jest */
import '../../../_setup'

const UpdateDebateStepMutation = /* GraphQL*/ `
  mutation UpdateDebateStepMutation($input: UpdateDebateStepInput!) {
    updateDebateStep(input: $input) {
            debateStep {
                title
                label
                body
                timeRange {
                    startAt
                    endAt
                }
                enabled
                timeless
                isAnonymousParticipationAllowed
                metaDescription
                customCode
                debateType
                debateContent
                debate {
                    id
                    articles {
                        edges {
                            node {
                              id 
                              url
                            }
                        }
                    }
                }
            }
        }
  }
`

const input = {
  id: 'RGViYXRlU3RlcDpkZWJhdGVTdGVwQ2FubmFiaXM=',
  label: 'Débatzz',
  body: 'body',
  title: 'Pour ou contre la légalisation du Cannabis ?',
  startAt: '2023-10-01 14:00:00',
  endAt: '2037-10-01 12:00:00',
  isEnabled: true,
  timeless: false,
  isAnonymousParticipationAllowed: false,
  metaDescription: 'meta description',
  customCode: 'custom code',
  debateType: 'FACE_TO_FACE',
  debateContent: 'content',
  articles: [
    {
      id: 'RGViYXRlQXJ0aWNsZTpjYW5hYmlzQXJ0aWNsZUJmbQ==',
      url: 'https://www.bfmtv.com/economie/estime-a-3-2-milliards-d-euros-en-france-le-marche-du-cannabis-serait-bien-plus-gros-que-ce-qu-on-pensait_AN-202010200002.html',
    },
    {
      id: 'RGViYXRlQXJ0aWNsZTpjYW5hYmlzQXJ0aWNsZU91ZXN0RnJhbmNlMQ==',
      url: 'https://www.ouest-france.fr/societe/cannabis/cannabis-therapeutique-le-cahier-des-charges-des-futurs-medicaments-publie-7020873',
    },
  ],
}

describe('mutations.updateDebateStep', () => {
  it('admin should be able to edit debate step.', async () => {
    const id = toGlobalId('DebateStep', 'debateStepCannabis') // RGViYXRlU3RlcDpkZWJhdGVTdGVwQ2FubmFiaXM=
    const response = await graphql(UpdateDebateStepMutation, { input: { ...input, id } }, 'internal_admin')
    expect(response).toMatchSnapshot()
  })
})
