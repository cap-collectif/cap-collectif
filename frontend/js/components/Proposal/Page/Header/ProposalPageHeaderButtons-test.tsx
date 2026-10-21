/* eslint-env jest */
import React from 'react'
import { ProposalPageHeaderButtons } from './ProposalPageHeaderButtons'
import { $refType, $fragmentRefs } from '~/mocks'
import type { ProposalPageHeaderButtons_proposal$data } from '~relay/ProposalPageHeaderButtons_proposal.graphql'

import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { IntlProvider } from 'react-intl'
import { openDeleteProposalModal } from '~/redux/modules/proposal'

// Keep unrelated Relay modals outside this local permissions contract.
jest.mock('../../Delete/ProposalDeleteModal', () => () => null)
jest.mock('../../Edit/ProposalEditModal', () => () => <div role="dialog" aria-label="Edit proposal" />)

const proposal = {
  ' $refType': $refType,
  ' $fragmentRefs': $fragmentRefs,
  id: 'proposalId',
  url: '/slash',
  title: 'OEEEEE',
  pendingRevisions: {
    totalCount: 0,
  },
  author: {
    id: 'authorid',
    slug: 'metal',
    displayName: 'flex',
  },
  canContactAuthor: true,
  contribuable: true,
  form: {
    contribuable: true,
  },
  publicationStatus: 'PUBLISHED',
  currentVotableStep: {
    id: 'stepid',
  },
  isArchived: false,
} as unknown as ProposalPageHeaderButtons_proposal$data
const authorViewer = {
  id: proposal.author.id,
  ' $fragmentSpreads': $fragmentRefs,
  ' $fragmentType': $refType,
}

/**
 * @jest-status compliant
 * @jest-reason Checks visible action labels and user interactions with real buttons and fresh providers.
 */
describe('<ProposalPageHeaderButtons /> author actions', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  const renderActions = (
    canEdit: boolean,
    canDelete: boolean,
    viewer: typeof authorViewer | null = authorViewer,
    open = true,
  ) => {
    const dispatch = jest.fn()
    const store = createStore(() => ({ user: { user: null } }))
    act(() => {
      root.render(
        React.createElement(
          Provider,
          { store },
          React.createElement(
            IntlProvider,
            { locale: 'en', messages: { 'global.edit': 'Edit', 'global.delete': 'Delete' } },
            <ProposalPageHeaderButtons
              step={null}
              proposal={{
                ...proposal,
                publicationStatus: 'DRAFT',
                canContactAuthor: false,
                contribuable: open,
                form: { ...proposal.form, contribuable: open },
                access: { canEdit, canDelete },
              }}
              viewer={viewer}
              dispatch={dispatch}
              participant={null}
              triggerRequirementsModal={jest.fn()}
            />,
          ),
        ),
      )
    })
    return dispatch
  }

  const button = (label: string) =>
    Array.from(container.querySelectorAll('button')).find(element => element.textContent === label)

  describe.each([true, false])('authenticated author: %s', authenticated => {
    it.each([
      [true, true],
      [true, false],
      [false, true],
      [false, false],
    ])('shows actions allowed by API permissions (edit=%s, delete=%s)', (canEdit, canDelete) => {
      renderActions(canEdit, canDelete, authenticated ? authorViewer : null)
      expect(Boolean(button('Edit'))).toBe(canEdit)
      expect(Boolean(button('Delete'))).toBe(canDelete)
    })
  })

  it('does not show author actions to another authenticated user', () => {
    renderActions(true, true, { ...authorViewer, id: 'another-user' })
    expect(button('Edit')).toBeUndefined()
    expect(button('Delete')).toBeUndefined()
  })

  it('does not offer editing or deletion when the collection is closed', () => {
    renderActions(true, true, authorViewer, false)
    expect(button('Edit')).toBeUndefined()
    expect(button('Delete')).toBeUndefined()
  })

  it('opens the edit dialog when the author clicks Edit', () => {
    renderActions(true, false)
    const editButton = button('Edit')
    expect(editButton).toBeDefined()
    act(() => editButton?.click())
    expect(container.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Edit proposal')
  })

  it('requests deletion when the author clicks Delete', () => {
    const dispatch = renderActions(false, true)
    const deleteButton = button('Delete')
    expect(deleteButton).toBeDefined()
    act(() => deleteButton?.click())
    expect(dispatch).toHaveBeenCalledWith(openDeleteProposalModal())
  })
})
