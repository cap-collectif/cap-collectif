/* eslint-env jest */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { useLazyLoadQuery } from 'react-relay'
import ProjectPage from './ProjectPage'

jest.mock('@cap-collectif/ui', () => ({
  Spinner: () => <div data-testid="project-page-spinner" />,
}))

jest.mock('react-relay', () => ({
  __esModule: true,
  graphql: jest.fn(),
  useLazyLoadQuery: jest.fn(),
}))

jest.mock('./ProjectPageLayout', () => ({
  __esModule: true,
  default: ({ project }) => <div>{project.title}</div>,
}))

describe('ProjectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders a suspense fallback while the project query is loading', () => {
    ;(useLazyLoadQuery as jest.Mock).mockImplementation(() => {
      throw new Promise(() => {})
    })

    render(<ProjectPage projectSlug="my-project" />)

    expect(screen.getByTestId('project-page-spinner')).toBeTruthy()
  })

  it('renders the project once the query resolves', () => {
    ;(useLazyLoadQuery as jest.Mock).mockReturnValue({
      project: { title: 'Project title' },
    })

    render(<ProjectPage projectSlug="my-project" />)

    expect(screen.getByText('Project title')).toBeTruthy()
  })
})
