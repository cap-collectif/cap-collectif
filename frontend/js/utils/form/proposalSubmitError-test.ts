/* eslint-env jest */
import { SubmissionError } from 'redux-form'
import proposalSubmitError from './proposalSubmitError'

/** @jest-status compliant */
describe('proposal submission errors', () => {
  it('identifies the denied media on the matching response', () => {
    const error = proposalSubmitError(
      {
        extensions: {
          code: 'MEDIA_REUSE_DENIED',
          questionId: 'editor-question',
          mediaReference: '/media/default/0001/01/private.png',
        },
      },
      [
        { question: 'other-question', value: 'Unchanged' },
        { question: 'editor-question', value: '<img src="/media/default/0001/01/private.png">' },
      ],
    )

    expect(error).toBeInstanceOf(SubmissionError)
    expect(error.errors).toEqual({
      _error: 'unauthorized-access',
      responses: [
        undefined,
        {
          value: {
            id: 'file-loading-failure',
            values: { fileName: '/media/default/0001/01/private.png' },
          },
        },
      ],
    })
  })

  it('identifies denied media in the main description', () => {
    const error = proposalSubmitError(
      { extensions: { code: 'MEDIA_REUSE_DENIED', field: 'body', mediaReference: '/media/private.png' } },
      [],
    )
    expect(error.errors.body).toEqual({ id: 'file-loading-failure', values: { fileName: '/media/private.png' } })
  })

  it('identifies a denied attachment on its media field', () => {
    const error = proposalSubmitError(
      {
        extensions: {
          code: 'MEDIA_REUSE_DENIED',
          field: 'medias',
          questionId: 'file-question',
          mediaReference: 'file.pdf',
        },
      },
      [{ question: 'file-question', value: [] }],
    )
    expect(error.errors.responses[0].value).toEqual({ id: 'file-loading-failure', values: { fileName: 'file.pdf' } })
  })

  it('preserves existing form validation errors', () => {
    const error = new SubmissionError({ title: 'question.title.max_length' })
    expect(proposalSubmitError(error, [])).toBe(error)
  })

  it('does not expose unexpected server error details', () => {
    expect(proposalSubmitError(new Error('Internal database details'), []).errors).toEqual({
      _error: 'global.error.server.form',
    })
  })
})
