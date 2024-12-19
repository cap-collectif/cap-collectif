/* eslint-env jest */
import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import ChangeLanguageNavBar from './ChangeLanguageNavBar'
import MockProviders, { mockedSSRData } from 'tests/testUtils'

describe('<ChangeLanguageNavBar />', () => {
  it('renders correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <ChangeLanguageNavBar locales={mockedSSRData.locales} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
