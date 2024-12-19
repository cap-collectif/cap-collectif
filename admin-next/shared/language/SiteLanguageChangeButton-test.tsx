/* eslint-env jest */
import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import SiteLanguageChangeButton from './SiteLanguageChangeButton'
import MockProviders from 'tests/testUtils'

describe('<SiteLanguageChangeButton />', () => {
  const props = {
    onChange: jest.fn(),
    defaultLanguage: 'fr-FR',
    languageList: [
      {
        translationKey: 'french',
        code: 'fr-FR',
      },
      {
        translationKey: 'english',
        code: 'en-GB',
      },
      {
        translationKey: 'deutsch',
        code: 'de-DE',
      },
    ],
  }
  it('renders correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <SiteLanguageChangeButton {...props} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
  it('should return null with a wrong defaultLanguage', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <SiteLanguageChangeButton {...props} defaultLanguage="Dothraki" />{' '}
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
