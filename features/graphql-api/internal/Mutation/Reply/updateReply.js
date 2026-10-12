/* eslint-env jest */
import { request, admin, user } from '../../../_privacyGraphql'

const fields = `id draft published publishedAt responses { ... on ValueResponse { value } }`
const update = `mutation($input: UpdateUserReplyInput!) {
  updateUserReply(input: $input) { reply { ${fields} } }
}`
const read = `query($id: ID!) { node(id: $id) { ... on Reply { ${fields} } } }`

/**
 * @jest-status compliant
 * @jest-reason Uses synthetic API data with final cleanup and fresh reads to verify publication and denied writes.
 */
describe('mutations.updateUserReplyMutation', () => {
  it.each([
    ['publish draft', 'valid', null],
    ['missing reply', 'missing', 'Reply not found.'],
    ['another author', 'other', 'Reply not found.'],
    ['required answers missing', 'invalid', 'reply.missing_required_responses '],
  ])('%s', async (_name, kind, error) => {
    let stepId
    try {
      const added = await request(
        `mutation($input: AddStepInput!) { addQuestionnaireStep(input: $input) {
          step { id ... on QuestionnaireStep { questionnaire { id } } }
        } }`,
        { input: { projectId: toGlobalId('Project', 'project9') } },
        'internal',
        admin,
      )
      stepId = added.addQuestionnaireStep.step.id
      const questionnaireId = added.addQuestionnaireStep.step.questionnaire.id
      const configured = await request(
        `mutation($input: UpdateQuestionnaireConfigurationInput!) {
          updateQuestionnaireConfiguration(input: $input) { questionnaire { questions { id } } }
        }`,
        {
          input: {
            questionnaireId,
            title: 'User reply publication test',
            questions: [{ question: { title: 'Required answer', type: 'text', required: true } }],
          },
        },
        'internal',
        admin,
      )
      const question = configured.updateQuestionnaireConfiguration.questionnaire.questions[0].id
      await request(
        `mutation($input: UpdateQuestionnaireStepInput!) { updateQuestionnaireStep(input: $input) {
          questionnaireStep { id }
        } }`,
        {
          input: {
            stepId,
            questionnaire: questionnaireId,
            label: 'Reply publication',
            isEnabled: true,
            timeless: true,
            requirements: [],
            operationType: 'EDIT',
          },
        },
        'internal',
        admin,
      )
      const created = await request(
        `mutation($input: AddUserReplyInput!) { addUserReply(input: $input) {
          errorCode reply { ${fields} }
        } }`,
        { input: { questionnaireId, draft: true, responses: [] } },
        'internal',
        admin,
      )
      expect(created.addUserReply.errorCode).toBeNull()
      const id = created.addUserReply.reply.id
      const before = (await request(read, { id }, 'internal', admin)).node
      expect(before.draft).toBe(true)
      const responses = kind === 'invalid' ? [] : [{ question, value: 'Published answer' }]
      const result = await request(
        update,
        { input: { replyId: kind === 'missing' ? toGlobalId('Reply', 'missing') : id, draft: false, responses } },
        'internal',
        kind === 'other' ? user : admin,
        true,
      )
      if (error) {
        if (kind === 'invalid') expect(result.errors[0].message).toEqual(expect.stringContaining(error))
        else expect(result.errors[0].message).toBe(error)
        expect(result.data.updateUserReply).toBeNull()
        expect((await request(read, { id }, 'internal', admin)).node).toEqual(before)
      } else {
        expect(result.errors).toBeUndefined()
        expect(result.data.updateUserReply.reply).toMatchObject({
          id,
          draft: false,
          published: true,
          publishedAt: expect.any(String),
          responses: [{ value: 'Published answer' }],
        })
        expect((await request(read, { id }, 'internal', admin)).node).toEqual(result.data.updateUserReply.reply)
        const edited = await request(
          update,
          {
            input: {
              replyId: id,
              draft: false,
              responses: [{ question, value: 'Edited answer' }],
            },
          },
          'internal',
          admin,
        )
        expect(edited.updateUserReply.reply.responses).toEqual([{ value: 'Edited answer' }])
        expect((await request(read, { id }, 'internal', admin)).node).toEqual(edited.updateUserReply.reply)
      }
    } finally {
      if (stepId)
        await request(
          `mutation($input: DeleteStepInput!) { deleteStep(input: $input) { stepId } }`,
          { input: { stepId, deleteRelatedResource: true } },
          'internal',
          admin,
        )
    }
  })
})
