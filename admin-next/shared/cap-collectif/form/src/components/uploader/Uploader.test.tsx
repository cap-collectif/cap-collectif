import React from 'react'
import { render } from '@testing-library/react'
import MockProviders from 'tests/testUtils'
import Uploader from './Uploader'

test.each([
  { id: 'proposal_media', multiple: false },
  { id: 'proposal_question_documents', multiple: true },
])('renders uploader ID $id exactly once', ({ id, multiple }) => {
  const { container } = render(
    <MockProviders>
      <Uploader id={id} multiple={multiple} />
    </MockProviders>,
  )

  const uploaders = container.querySelectorAll(`[id="${id}"]`)
  expect(uploaders).toHaveLength(1)
  expect(uploaders[0].querySelector('input[type="file"]')).not.toBeNull()
})
