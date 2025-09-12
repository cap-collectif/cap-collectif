/* eslint-env jest */
import { render } from '@testing-library/react'
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
    const { asFragment } = render(
      <MockProviders>
        <SiteLanguageChangeButton {...props} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('should return null with a wrong defaultLanguage', () => {
    const { asFragment } = render(
      <MockProviders>
        <SiteLanguageChangeButton {...props} defaultLanguage="Dothraki" />{' '}
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
