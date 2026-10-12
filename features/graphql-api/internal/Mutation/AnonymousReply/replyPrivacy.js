/* eslint-env jest */
import { request, replyCookie, participantCookie, admin, user, emptyPage } from '../../../_privacyGraphql'
import fetch from 'node-fetch'
import FormData from 'form-data'

const content = `id responses {
  ... on ValueResponse { id value formattedValue }
  ... on MediaResponse { id medias { url } }
}`
const readReply = `query($id: ID!) { node(id: $id) { ... on Reply { ${content} } } }`
const creationPayload = `errorCode participantToken created: reply { ${content} completionStatus requirementsUrl
    contributor { ... on Participant { replies(first: 10) { totalCount } } }
  }
  questionnaire { replies(first: 10) { edges { node { id } } pageInfo { startCursor endCursor hasNextPage hasPreviousPage } }
    questions { responses { edges { node { ... on ValueResponse { value } } } } }
  }
`
const create = `mutation($input: AddAnonymousReplyInput!) { addAnonymousReply(input: $input) { ${creationPayload} } }`
const update = `mutation($input: UpdateAnonymousReplyInput!) { updateAnonymousReply(input: $input) {
  reply { ${content} questionnaire { replies { edges { node { id } } } } }
} }`

/** @jest-status compliant
 * @jest-reason Creates synthetic data through the real API, asserts both allowed and denied reads,
 * and deletes the temporary questionnaire, step and uploaded media in finally.
 */
describe('Private reply lifecycle', () => {
  it('preserves anonymous creation, cookie reads, update and deletion without granting other replies', async () => {
    let stepId
    let first
    let second
    let reused
    let mediaId
    try {
      const form = new FormData()
      form.append(
        'file',
        Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEElEQVR4nGP4z8AARAwQCgAf7gP9i18U1AAAAABJRU5ErkJggg==',
          'base64',
        ),
        { filename: 'reply-privacy.png', contentType: 'image/png' },
      )
      const upload = await fetch('https://capco.test/api/files', { method: 'POST', body: form })
      const uploaded = await upload.json()
      mediaId = uploaded.id
      expect(mediaId).toEqual(expect.any(String))
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
            title: 'Synthetic confidentiality test',
            questions: [
              { question: { title: 'Email', type: 'text', required: false, private: false } },
              { question: { title: 'Document', type: 'medias', required: false, private: false } },
              { question: { title: 'Phone', type: 'text', required: false, private: false } },
              { question: { title: 'Address', type: 'text', required: false, private: false } },
            ],
          },
        },
        'internal',
        admin,
      )
      await request(
        `mutation($input: UpdateQuestionnaireParametersInput!) { updateQuestionnaireParameters(input: $input) {
        questionnaire { id }
      } }`,
        { input: { questionnaireId, anonymousAllowed: true, multipleRepliesAllowed: true, type: 'QUESTIONNAIRE' } },
        'internal',
        admin,
      )
      const [email, media, phone, address] = configured.updateQuestionnaireConfiguration.questionnaire.questions
      await request(
        `mutation($input: UpdateQuestionnaireStepInput!) { updateQuestionnaireStep(input: $input) {
        questionnaireStep { id }
      } }`,
        {
          input: {
            stepId,
            questionnaire: questionnaireId,
            label: 'Privacy test',
            isEnabled: true,
            timeless: true,
            requirements: [{ type: 'FIRSTNAME' }],
            operationType: 'EDIT',
          },
        },
        'internal',
        admin,
      )
      const responses = [
        { question: email.id, value: 'private-participant@example.test' },
        { question: media.id, medias: [mediaId] },
        { question: phone.id, value: '+33 0 00 00 00 00' },
        { question: address.id, value: '1 rue du Test, Ville fictive' },
      ]
      const created = await request(
        `mutation($input: AddAnonymousReplyInput!, $other: AddAnonymousReplyInput!) {
          first: addAnonymousReply(input: $input) { ${creationPayload} }
          second: addAnonymousReply(input: $other) { ${creationPayload} }
        }`,
        {
          input: { questionnaireId, responses },
          other: { questionnaireId, responses: [{ question: email.id, value: 'other@example.test' }] },
        },
      )
      first = { ...created.first, reply: created.first.created }
      second = { ...created.second, reply: created.second.created }
      expect(first.errorCode).toBeNull()
      expect(second.errorCode).toBeNull()
      expect(first.participantToken).not.toBe(second.participantToken)
      expect(first.reply.contributor.replies.totalCount).toBe(0)
      expect(second.reply.contributor.replies.totalCount).toBe(0)
      expect(second.reply.responses[0]).toMatchObject({ value: 'other@example.test' })
      expect(first.reply.completionStatus).toBe('MISSING_REQUIREMENTS')
      expect(first.reply.requirementsUrl).toEqual(expect.any(String))
      expect(first.reply.responses[0]).toMatchObject({
        value: 'private-participant@example.test',
        formattedValue: 'private-participant@example.test',
      })
      expect(first.reply.responses[1].medias).toHaveLength(1)
      expect(first.questionnaire.replies).toEqual({ edges: [], pageInfo: emptyPage })
      first.questionnaire.questions.forEach(question => expect(question.responses.edges).toEqual([]))
      const deniedReuse = await request(
        create,
        { input: { questionnaireId, responses } },
        'internal',
        participantCookie(second.participantToken),
      )
      expect(deniedReuse.addAnonymousReply.errorCode).toBe('INVALID_FORM')
      expect(deniedReuse.addAnonymousReply.created).toBeNull()
      const reusedPayload = (
        await request(
          create,
          { input: { questionnaireId, responses } },
          'internal',
          participantCookie(first.participantToken),
        )
      ).addAnonymousReply
      reused = { ...reusedPayload, reply: reusedPayload.created }
      expect(reused.errorCode).toBeNull()
      expect(reused.participantToken).toBe(first.participantToken)
      expect(
        (await request(readReply, { id: reused.reply.id }, 'internal', participantCookie(first.participantToken))).node
          .id,
      ).toBe(reused.reply.id)
      const rawQuestionnaireId = Buffer.from(questionnaireId, 'base64').toString().split(':')[1]
      const cookie = replyCookie(first.reply.id, first.participantToken, rawQuestionnaireId)
      for (const schema of ['preview', 'internal']) {
        expect((await request(readReply, { id: first.reply.id }, schema)).node).toBeNull()
        const own = await request(readReply, { id: first.reply.id }, schema, cookie)
        expect(own.node.responses[0]).toMatchObject({ value: 'private-participant@example.test' })
        expect(own.node.responses[1].medias).toHaveLength(1)
        expect(own.node.responses[2]).toMatchObject({ value: '+33 0 00 00 00 00' })
        expect(own.node.responses[3]).toMatchObject({ value: '1 rue du Test, Ville fictive' })
        expect((await request(readReply, { id: second.reply.id }, schema, cookie)).node).toBeNull()
      }
      for (const response of first.reply.responses) {
        expect((await request(`query($id: ID!) { node(id: $id) { id } }`, { id: response.id })).node).toBeNull()
      }
      const updated = await request(
        update,
        {
          input: {
            replyId: first.reply.id,
            responses: [{ question: email.id, value: 'updated@example.test' }],
          },
        },
        'internal',
        participantCookie(first.participantToken),
      )
      expect(updated.updateAnonymousReply.reply.responses[0]).toMatchObject({ value: 'updated@example.test' })
      expect(updated.updateAnonymousReply.reply.questionnaire.replies.edges).toEqual([])
      expect((await request(readReply, { id: first.reply.id }, 'internal', cookie)).node.responses[0]).toMatchObject({
        value: 'updated@example.test',
      })
      for (const [headers, message] of [
        [{}, 'Participant not found.'],
        [participantCookie(second.participantToken), 'Reply not found'],
      ]) {
        const deniedUpdate = await request(
          update,
          { input: { replyId: first.reply.id, responses: [{ question: email.id, value: 'forbidden-overwrite' }] } },
          'internal',
          headers,
          true,
        )
        expect(deniedUpdate.errors[0].message).toBe(message)
        expect(deniedUpdate.data.updateAnonymousReply).toBeNull()
        const deniedDelete = await request(
          `mutation($input: DeleteAnonymousReplyInput!) { deleteAnonymousReply(input: $input) { replyId } }`,
          { input: { replyId: first.reply.id } },
          'internal',
          headers,
          true,
        )
        expect(deniedDelete.errors[0].message).toBe(message)
        expect(deniedDelete.data.deleteAnonymousReply).toBeNull()
        expect(
          (await request(readReply, { id: first.reply.id }, 'internal', participantCookie(first.participantToken))).node
            .responses[0],
        ).toMatchObject({ value: 'updated@example.test' })
      }
      const operation = await request(
        `mutation($own: UpdateAnonymousReplyInput!, $other: UpdateAnonymousReplyInput!) {
        own: updateAnonymousReply(input: $own) { reply { id responses { ... on ValueResponse { value } } } }
        other: updateAnonymousReply(input: $other) { reply { id responses { ... on ValueResponse { value } } } }
      }`,
        {
          own: {
            replyId: first.reply.id,
            responses: [{ question: email.id, value: 'updated@example.test' }],
          },
          other: { replyId: second.reply.id, responses: [] },
        },
        'internal',
        participantCookie(first.participantToken),
        true,
      )
      expect(operation.data.own.reply.id).toBe(first.reply.id)
      expect(operation.data.other).toBeNull()
      expect(operation.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ message: 'Reply not found' })]),
      )
      for (const participantToken of ['invalid', first.participantToken]) {
        const denied = await request(
          update,
          { input: { replyId: second.reply.id, responses: [] } },
          'internal',
          participantCookie(participantToken),
          true,
        )
        expect(denied.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ message: expect.stringMatching(/Invalid participant cookie|Reply not found/) }),
          ]),
        )
        expect(denied.data?.updateAnonymousReply ?? null).toBeNull()
      }
      await request(
        `mutation($input: UpdateParticipantInput!) { updateParticipant(input: $input) { participant { firstname } } }`,
        { input: { token: first.participantToken, firstname: 'Synthetic participant' } },
      )
      const validated = await request(
        `mutation($input: ValidateContributionInput!) { validateContribution(input: $input) { redirectUrl } }`,
        { input: { token: first.participantToken, contributionId: first.reply.id } },
      )
      expect(validated.validateContribution.redirectUrl).toEqual(expect.any(String))
      const completed = await request(
        `query($id: ID!) { node(id: $id) { ... on Reply { completionStatus } } }`,
        { id: first.reply.id },
        'internal',
        cookie,
      )
      expect(completed.node.completionStatus).toBe('COMPLETED')
      // A mutation authorization is confined to that request and the validated reply.
      expect((await request(readReply, { id: first.reply.id })).node).toBeNull()
      const connected = await request(
        `mutation($input: AddUserReplyInput!) { addUserReply(input: $input) { errorCode reply { ${content} } } }`,
        {
          input: { questionnaireId, responses: [{ question: email.id, value: 'connected@example.test' }], draft: true },
        },
        'internal',
        user,
      )
      expect(connected.addUserReply.errorCode).toBeNull()
      expect(connected.addUserReply.reply.responses[0]).toMatchObject({ value: 'connected@example.test' })
      const ownList = await request(
        `query($id: ID!) { node(id: $id) { ... on Questionnaire {
        viewerReplies(first: 10) { edges { node { id responses { ... on ValueResponse { value } } } } }
      } } }`,
        { id: questionnaireId },
        'internal',
        user,
      )
      expect(ownList.node.viewerReplies.edges.map(edge => edge.node.id)).toContain(connected.addUserReply.reply.id)
    } finally {
      for (const created of [first, second, reused]) {
        if (created?.reply?.id && created.participantToken) {
          const deleted = await request(
            `mutation($input: DeleteAnonymousReplyInput!) { deleteAnonymousReply(input: $input) { replyId } }`,
            { input: { replyId: created.reply.id } },
            'internal',
            participantCookie(created.participantToken),
          )
          expect(deleted.deleteAnonymousReply.replyId).toBe(created.reply.id)
          expect(
            (
              await request(
                readReply,
                { id: created.reply.id },
                'internal',
                participantCookie(created.participantToken),
              )
            ).node,
          ).toBeNull()
        }
      }
      if (stepId)
        await request(
          `mutation($input: DeleteStepInput!) { deleteStep(input: $input) { stepId } }`,
          { input: { stepId, deleteRelatedResource: true } },
          'internal',
          admin,
        )
      if (mediaId)
        await request(
          `mutation($input: DeleteMediaAdminInput!) { deleteMediaAdmin(input: $input) { deletedMediaIds } }`,
          { input: { ids: [mediaId] } },
          'internal',
          admin,
        )
    }
  })
})
