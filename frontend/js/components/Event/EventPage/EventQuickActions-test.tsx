/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import EventQuickActions from './EventQuickActions'
import MockProviders, { enableFeatureFlags, addsSupportForPortals, clearSupportForPortals } from '~/testUtils'

describe('<EventQuickActions />', () => {
  beforeEach(() => {
    addsSupportForPortals()
  })
  afterEach(() => {
    clearSupportForPortals()
  })
  it('should render correctly with the right conditions', () => {
    enableFeatureFlags(['allow_users_to_propose_events'])
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <EventQuickActions id="id" viewerDidAuthor status="APPROVED" />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
  it('should return nothing with the right conditions', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <EventQuickActions id="id" viewerDidAuthor={false} status="REFUSED" />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
