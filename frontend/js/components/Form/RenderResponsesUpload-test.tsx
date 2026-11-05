import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { IntlProvider } from 'react-intl'
import RenderResponses from './RenderResponses'
import Fetcher from '~/services/Fetcher'

// Keep the upload widget real; replace the Redux field adapter only.
jest.mock('redux-form', () => {
  const FileUpload = require('./FileUpload/FileUpload').default
  return { Field: props => <FileUpload {...props} value={[]} onChange={() => {}} /> }
})
jest.mock('./Field', () => () => null)
jest.mock('./Select', () => () => null)
jest.mock('~/createRelayEnvironment', () => ({}))
jest.mock('@shared/utils/responsesHelper', () => ({ MULTIPLE_QUESTION_CHOICES_SEARCH_QUERY: {} }))
jest.mock('~/services/Fetcher', () => ({
  __esModule: true,
  default: { postFormData: jest.fn() },
  json: value => value,
}))

/**
 * @jest-status compliant
 * @jest-reason Selects a file in the rendered attachment widget and checks the upload request, with Redux and HTTP adapters stubbed.
 */
describe('attachment question upload', () => {
  it.each(['default', 'questionnaire'])('sends the question identifier for a %s form', async typeForm => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    const file = new File(['document'], 'document.pdf', { type: 'application/pdf' })
    const post = Fetcher.postFormData as jest.Mock
    post.mockResolvedValue({ id: 'media', name: file.name, size: file.size, url: '/media/document.txt' })
    jest.useFakeTimers()
    try {
      await act(async () => {
        root.render(
          <IntlProvider locale="en" messages={{}}>
            <RenderResponses
              {...({
                fields: ['responses[0]'],
                questions: [
                  { id: 'Question:private', type: 'medias', title: 'Private document', private: true, jumps: [] },
                ],
                responses: [],
                availableQuestions: ['Question:private'],
                intl: { formatMessage: ({ id }) => id },
                form: 'upload-test',
                change: jest.fn(),
                disabled: false,
                typeForm,
              } as any)}
            />
          </IntlProvider>,
        )
      })
      const input = host.querySelector('input[type="file"]')
      expect(input).not.toBeNull()
      Object.defineProperty(input, 'files', { value: [file] })
      await act(async () => {
        input?.dispatchEvent(new Event('change', { bubbles: true }))
      })
      expect(post).toHaveBeenCalledTimes(1)
      const [path, body] = post.mock.calls[0]
      expect(path).toBe('/files')
      expect(body.get('questionId')).toBe('Question:private')
      expect(body.get('file')).toBe(file)
    } finally {
      act(() => root.unmount())
      host.remove()
      jest.clearAllTimers()
      jest.useRealTimers()
    }
  })
})
